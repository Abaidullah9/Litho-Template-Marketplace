import { hashPassword, verifyPassword } from "../auth.js";
import { badRequest, conflict, forbidden, notFound, upstream } from "../errors.js";

function cryptoSafeEqual(left, right) {
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

function equalSecrets(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return cryptoSafeEqual(left, right);
}

/**
 * Find an admin user by username in Supabase.
 */
export async function findByUsername(client, username) {
  if (!client || !username) return null;
  try {
    const { data, error } = await client
      .from("admin_users")
      .select("id, username, password_hash, role")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Seed or update the primary admin user in Supabase from environment configuration.
 */
export async function seedAdminUser(client, username, password) {
  if (!client || !username || !password) return null;
  try {
    const existing = await findByUsername(client, username);
    if (existing) return existing;

    const passwordHash = hashPassword(password);
    const { data, error } = await client
      .from("admin_users")
      .insert({
        username: username.toLowerCase(),
        password_hash: passwordHash,
        role: "admin",
      })
      .select("id, username, role")
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Authenticate an admin user with username and password.
 * Checks Supabase admin_users table first; falls back to environment config
 * and auto-seeds the admin user into Supabase upon successful login.
 */
export async function authenticateAdmin(client, username, password, config) {
  const userToMatch = (username || config.adminUsername || "admin").toLowerCase().trim();
  const envAdminUser = (config.adminUsername || "admin").toLowerCase().trim();

  // 1. Try Supabase lookup
  const dbUser = await findByUsername(client, userToMatch);
  if (dbUser) {
    const hash = dbUser.password_hash;
    const isMatch = hash.includes(":")
      ? verifyPassword(password, hash)
      : equalSecrets(password, hash);

    if (isMatch) {
      return { id: dbUser.id, username: dbUser.username, role: dbUser.role };
    }
    return null;
  }

  // 2. Fallback to .env config
  const matchesEnvUser = userToMatch === envAdminUser;
  const matchesEnvPassword = equalSecrets(password, config.adminPassword);

  if (matchesEnvUser && matchesEnvPassword) {
    // Auto-seed into Supabase in background
    if (client) {
      seedAdminUser(client, envAdminUser, config.adminPassword).catch(() => {});
    }
    return { username: envAdminUser, role: "admin" };
  }

  return null;
}

/**
 * List all admin users without exposing password hashes.
 */
export async function listAdminUsers(client) {
  if (!client) throw upstream("Database client unavailable.");
  const { data, error } = await client
    .from("admin_users")
    .select("id, username, role, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) throw upstream(error.message);
  return data || [];
}

/**
 * Create a new admin user in Supabase with scrypt hashed password.
 */
export async function createAdminUser(client, { username, password, role = "admin" }) {
  if (!client) throw upstream("Database client unavailable.");
  const cleanUsername = String(username || "").toLowerCase().trim();

  if (!cleanUsername || !/^[a-z0-9_.-]{3,32}$/.test(cleanUsername)) {
    throw badRequest("Username must be between 3 and 32 characters and contain only letters, numbers, underscores, dots, or dashes.");
  }

  const cleanPassword = String(password || "");
  if (!cleanPassword || cleanPassword.length < 8) {
    throw badRequest("Password must be at least 8 characters long.");
  }
  if (cleanPassword.length > 128) {
    throw badRequest("Password cannot exceed 128 characters.");
  }

  const allowedRoles = ["admin", "editor", "viewer"];
  const cleanRole = allowedRoles.includes(role) ? role : "admin";

  const existing = await findByUsername(client, cleanUsername);
  if (existing) {
    throw conflict(`An admin user with username "${cleanUsername}" already exists.`);
  }

  const passwordHash = hashPassword(cleanPassword);
  const { data, error } = await client
    .from("admin_users")
    .insert({
      username: cleanUsername,
      password_hash: passwordHash,
      role: cleanRole,
    })
    .select("id, username, role, created_at, updated_at")
    .maybeSingle();

  if (error) throw upstream(error.message);
  if (data && "password_hash" in data) {
    delete data.password_hash;
  }
  return data;
}

/**
 * Delete an admin user with safety guards protecting against self-deletion or lockout.
 */
export async function deleteAdminUser(client, id, currentUsername, primaryUsername) {
  if (!client) throw upstream("Database client unavailable.");
  if (!id) throw badRequest("Admin user ID is required.");

  const { data: user, error: findError } = await client
    .from("admin_users")
    .select("id, username")
    .eq("id", id)
    .maybeSingle();

  if (findError) throw upstream(findError.message);
  if (!user) throw notFound("Admin user not found.");

  const targetUsername = user.username.toLowerCase();
  if (currentUsername && targetUsername === currentUsername.toLowerCase().trim()) {
    throw forbidden("You cannot delete your own admin account while signed in.");
  }

  if (primaryUsername && targetUsername === primaryUsername.toLowerCase().trim()) {
    throw forbidden("The primary admin account defined in .env cannot be deleted.");
  }

  const { count, error: countError } = await client
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (!countError && count !== null && count <= 1) {
    throw forbidden("Cannot delete the only remaining admin account.");
  }

  const { error: deleteError } = await client
    .from("admin_users")
    .delete()
    .eq("id", id);

  if (deleteError) throw upstream(deleteError.message);
  return { ok: true, id: user.id, username: user.username };
}

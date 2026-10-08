import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const siteRoot = path.join(projectRoot, "site");
export const uploadsRoot = path.join(projectRoot, "uploads");
export const registryPath = path.join(siteRoot, "registry.json");

const PLACEHOLDER = /CHANGE_ME|YOUR_/;

function readEnvFile() {
  const envPath = path.join(projectRoot, ".env");
  if (existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // A malformed .env must not crash the process; missing values are
      // reported by validateConfig() when they are actually needed.
    }
  }
}

readEnvFile();

/**
 * Build the runtime configuration from the environment.
 * `required` reports which secrets are still placeholders so callers can fail
 * with an actionable message instead of a Supabase client error.
 */
export function loadConfig(env = process.env) {
  const config = {
    root: projectRoot,
    siteRoot,
    uploadsRoot,
    registryPath,
    // Some sandboxes inject PORT="0"; treat 0/empty/NaN as unset and fall
    // back to the default port.
    port: Number(env.PORT) > 0 ? Number(env.PORT) : 8787,
    host: env.HOST || "127.0.0.1",
    publicBaseUrl: (env.PUBLIC_BASE_URL || `http://localhost:${env.PORT || 8787}`).replace(/\/$/, ""),
    nodeEnv: env.NODE_ENV || "development",
    supabaseUrl: (env.SUPABASE_URL || "").trim(),
    supabaseAnonKey: (env.SUPABASE_ANON_KEY || "").trim(),
    supabaseServiceRoleKey: (env.SUPABASE_SERVICE_ROLE_KEY || "").trim(),
    supabaseDbUrl: (env.SUPABASE_DB_URL || "").trim(),
    adminUsername: (env.ADMIN_USERNAME || "admin").trim(),
    adminPassword: env.ADMIN_PASSWORD || "",
    adminSessionSecret: env.ADMIN_SESSION_SECRET || "",
    sessionTtlSeconds: Number(env.ADMIN_SESSION_TTL || 60 * 60 * 8),
  };

  config.isPlaceholder = (value) => !value || PLACEHOLDER.test(value);
  config.supabaseConfigured = Boolean(
    config.supabaseUrl.startsWith("http")
    && !config.isPlaceholder(config.supabaseServiceRoleKey)
    && !config.isPlaceholder(config.supabaseAnonKey),
  );
  config.adminConfigured = !config.isPlaceholder(config.adminPassword)
    && !config.isPlaceholder(config.adminSessionSecret)
    && config.adminPassword.length >= 8
    && config.adminSessionSecret.length >= 16;

  config.missing = {
    supabase: !config.supabaseConfigured,
    admin: !config.adminConfigured,
  };

  return config;
}

export function requireSupabase(config) {
  if (config.supabaseConfigured) return;
  throw new Error(
    "Supabase is not configured. Fill in SUPABASE_URL, SUPABASE_ANON_KEY and "
    + "SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example).",
  );
}

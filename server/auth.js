import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { forbidden, unauthorized } from "./errors.js";

const COOKIE_NAME = "tmp_admin_session";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(String(password), salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string" || !storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = scryptSync(String(password), salt, 64);
  if (keyBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(keyBuffer, derivedKey);
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Session model: a signed `exp.nonce.username.signature` token in an httpOnly cookie.
 * Secure, tamper-proof, and stateless while carrying authenticated admin identity.
 */
export function createSessionToken(secret, ttlSeconds, username = "admin", now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + ttlSeconds;
  const nonce = randomBytes(8).toString("base64url");
  const cleanUsername = String(username || "admin").toLowerCase().trim();
  const payload = `${expiresAt}.${nonce}.${encodeURIComponent(cleanUsername)}`;
  return { token: `${payload}.${sign(payload, secret)}`, expiresAt };
}

export function verifySessionToken(token, secret, now = Date.now()) {
  if (typeof token !== "string" || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 && parts.length !== 4) return null;

  let expiresAt;
  let nonce;
  let username = "admin";
  let signature;
  let payload;

  if (parts.length === 4) {
    let rawUser;
    [expiresAt, nonce, rawUser, signature] = parts;
    try {
      username = decodeURIComponent(rawUser);
    } catch {
      username = rawUser;
    }
    payload = `${expiresAt}.${nonce}.${rawUser}`;
  } else {
    [expiresAt, nonce, signature] = parts;
    payload = `${expiresAt}.${nonce}`;
  }

  if (!/^\d+$/.test(expiresAt) || !nonce) return null;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expiresAt) * 1000 <= now) return null;

  return { valid: true, expiresAt: Number(expiresAt), username };
}

export function parseCookies(req) {
  const header = req.headers?.cookie;
  const cookies = {};
  if (!header) return cookies;
  for (const pair of header.split(";")) {
    const index = pair.indexOf("=");
    if (index < 0) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export function sessionCookie(token, expiresAt) {
  const attributes = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.max(0, expiresAt - Math.floor(Date.now() / 1000))}`,
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  return attributes.join("; ");
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function readSession(req, secret) {
  return verifySessionToken(parseCookies(req)[COOKIE_NAME], secret);
}

/** Express middleware: reject any request without a valid admin session. */
export function requireAdmin(config) {
  return (req, res, next) => {
    if (!config.adminConfigured) {
      next(unauthorized("Admin access is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env."));
      return;
    }
    const session = readSession(req, config.adminSessionSecret);
    if (!session) {
      next(unauthorized());
      return;
    }
    req.isAdmin = true;
    req.adminUsername = session.username || config.adminUsername || "admin";
    next();
  };
}

/**
 * CSRF Protection middleware: blocks cross-origin state mutations on admin endpoints.
 */
export function verifyAdminOrigin(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return next(forbidden("Cross-origin request blocked (CSRF protection)."));
      }
    } catch {
      return next(forbidden("Invalid Origin header (CSRF protection)."));
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return next(forbidden("Cross-origin request blocked (CSRF protection)."));
      }
    } catch {
      return next(forbidden("Invalid Referer header (CSRF protection)."));
    }
  }
  next();
}

export { COOKIE_NAME };

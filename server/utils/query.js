import { badRequest } from "../errors.js";

/** Clamp a numeric query parameter, falling back when it is absent or not a number. */
function intParam(value, fallback, { min = 1, max = 100 } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Identifiers reach a PostgREST `or=` filter, so allow only slug/uuid bytes. */
function safeIdentifier(value) {
  const clean = String(value || "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80);
  if (!clean) throw badRequest("A template identifier is required.");
  return clean;
}

export { intParam, safeIdentifier };

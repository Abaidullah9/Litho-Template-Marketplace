/**
 * Minimal in-memory sliding-window limiter.
 *
 * Deliberately process-local: the first version must not add Redis or any
 * other infrastructure. It only needs to make anonymous event endpoints
 * boring to abuse, not to be a distributed quota system.
 */
export function createRateLimiter({ windowMs = 60_000, max = 60, now = Date.now } = {}) {
  const hits = new Map();

  function prune(current) {
    for (const [key, timestamps] of hits) {
      const alive = timestamps.filter((time) => time > current - windowMs);
      if (alive.length) hits.set(key, alive);
      else hits.delete(key);
    }
  }

  return {
    check(key, limit = max) {
      const current = now();
      if (hits.size > 5_000) prune(current);
      const timestamps = (hits.get(key) || []).filter((time) => time > current - windowMs);
      if (timestamps.length >= limit) {
        hits.set(key, timestamps);
        return { allowed: false, remaining: 0, retryAfter: Math.ceil((windowMs - (current - timestamps[0])) / 1000) };
      }
      timestamps.push(current);
      hits.set(key, timestamps);
      return { allowed: true, remaining: limit - timestamps.length, retryAfter: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}

export function clientKey(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

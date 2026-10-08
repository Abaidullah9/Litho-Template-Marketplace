/**
 * Marketplace API client (view / download counters and submissions).
 *
 * The public marketplace reads the generated registry for browsing, and posts
 * anonymous counters back to the API. Failures are swallowed: a blocked
 * counter must never break the page.
 */

function safeSlug(value) {
  return encodeURIComponent(String(value || "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80));
}

export async function recordTemplateEvent(identifier, type) {
  const slug = safeSlug(identifier);
  if (!slug || !["view", "download"].includes(type)) return null;
  try {
    const response = await fetch(`/api/templates/${slug}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      keepalive: true,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/** Record at most one view per browser session per template. */
export function recordTemplateViewOnce(identifier) {
  const key = `template-view:${identifier}`;
  try {
    if (sessionStorage.getItem(key)) return Promise.resolve(null);
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage is optional; still record the view */
  }
  return recordTemplateEvent(identifier, "view");
}

/**
 * Public API serialization.
 *
 * Views are pure: they take already-fetched rows and return the exact JSON
 * shape the public marketplace consumes, so response contracts can be read in
 * one place instead of being spread across handlers.
 */

function paged(items, { total, page, perPage }) {
  return {
    items,
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** A filter that matched no taxonomy row short-circuits to an empty page. */
function emptyPage(page, perPage) {
  return { items: [], total: 0, page, perPage, pages: 0 };
}

function categorySummary(category, templateCount = 0) {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description || "",
    templateCount,
  };
}

function categoryDetail(category, { templates = [], total = 0 } = {}) {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description || "",
    templateCount: total,
    templates,
  };
}

function tagSummary(tag, templateCount = 0) {
  return { slug: tag.slug, name: tag.name, templateCount };
}

function publisherSummary(publisher, templateCount = 0) {
  return {
    slug: publisher.slug,
    name: publisher.name,
    description: publisher.description || "",
    websiteUrl: publisher.website_url || null,
    avatarUrl: publisher.avatar_url || null,
    templateCount,
  };
}

function submissionReceipt(row) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    message: "Thanks! Your template was received and is now pending review.",
  };
}

function health(config) {
  return {
    status: "ok",
    supabase: config.supabaseConfigured,
    admin: config.adminConfigured,
    time: new Date().toISOString(),
  };
}

function eventAccepted(type, slug) {
  return { ok: true, type, slug };
}

export {
  categoryDetail,
  categorySummary,
  emptyPage,
  eventAccepted,
  health,
  paged,
  publisherSummary,
  submissionReceipt,
  tagSummary,
};

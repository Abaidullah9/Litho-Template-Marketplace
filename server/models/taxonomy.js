import { conflict, upstream } from "../errors.js";
import { UUID_PATTERN } from "./templates.js";

/** Count rows in any table that has an `id` column. */
async function countRows(client, table) {
  const { count, error } = await client.from(table).select("id", { count: "exact", head: true });
  if (error) throw upstream();
  return count || 0;
}

// ---------------------------------------------------------------------------
// Row mapping (validated payload -> database row)
// ---------------------------------------------------------------------------

function toCategoryRow(payload) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    enabled: payload.enabled,
    sort_order: payload.sortOrder,
  };
}

function toPublisherRow(payload) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    website_url: payload.websiteUrl || null,
    avatar_url: payload.avatarUrl || null,
    enabled: payload.enabled,
  };
}

// ---------------------------------------------------------------------------
// Reference resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a taxonomy reference supplied as either a slug or a UUID into the
 * primary key the template tables store.
 */
async function resolveId(client, table, value) {
  if (!value) return null;
  const column = UUID_PATTERN.test(value) ? "id" : "slug";
  const { data, error } = await client.from(table).select("id").eq(column, value).maybeSingle();
  if (error) throw upstream();
  return data?.id || null;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/** Public list: enabled categories only, in curated display order. */
async function listEnabledCategories(client) {
  const { data, error } = await client
    .from("categories").select("*").eq("enabled", true).order("sort_order").order("name");
  if (error) throw upstream();
  return data || [];
}

/** Admin list: every category, enabled or not. */
async function listCategories(client) {
  const { data, error } = await client
    .from("categories").select("*").order("sort_order").order("name");
  if (error) throw upstream();
  return data || [];
}

async function findCategoryBySlug(client, slug) {
  const { data, error } = await client
    .from("categories").select("*").eq("slug", String(slug)).maybeSingle();
  if (error) throw upstream();
  return data || null;
}

function categoryOptions(client) {
  return client.from("categories").select("id, slug, name");
}

/** Templates per category, optionally restricted to published rows. */
async function countsByCategory(client, { publishedOnly = false } = {}) {
  let query = client.from("templates").select("id, category_id");
  if (publishedOnly) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw upstream();
  const counts = new Map();
  for (const row of data || []) {
    if (!row.category_id) continue;
    counts.set(row.category_id, (counts.get(row.category_id) || 0) + 1);
  }
  return counts;
}

async function publishedInCategory(client, categoryId) {
  const { data, error, count } = await client
    .from("templates").select("*", { count: "exact" })
    .eq("status", "published").eq("category_id", categoryId)
    .order("published_at", { ascending: false });
  if (error) throw upstream();
  return { rows: data || [], total: count || 0 };
}

async function insertCategory(client, row) {
  const { data, error } = await client.from("categories").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") throw conflict("A category with this slug already exists.");
    throw upstream();
  }
  return data;
}

async function updateCategory(client, id, row) {
  const { data, error } = await client
    .from("categories").update(row).eq("id", id).select("*").maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function deleteCategory(client, id) {
  const { data, error } = await client.from("categories").delete().eq("id", id).select("slug").maybeSingle();
  if (error) throw upstream();
  return data || null;
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

async function listTags(client) {
  const { data, error } = await client.from("tags").select("*").order("name");
  if (error) throw upstream();
  return data || [];
}

async function allTagLinks(client) {
  const { data, error } = await client.from("template_tags").select("template_id, tag_id");
  if (error) throw upstream();
  return data || [];
}

async function tagLinkCounts(client) {
  const { data, error } = await client.from("template_tags").select("tag_id");
  if (error) throw upstream();
  const counts = new Map();
  for (const link of data || []) counts.set(link.tag_id, (counts.get(link.tag_id) || 0) + 1);
  return counts;
}

async function publishedTemplateIds(client) {
  const { data, error } = await client.from("templates").select("id").eq("status", "published");
  if (error) throw upstream();
  return new Set((data || []).map((row) => row.id));
}

function tagOptions(client) {
  return client.from("tags").select("id, slug, name");
}

async function insertTag(client, row) {
  const { data, error } = await client.from("tags").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") throw conflict("A tag with this slug already exists.");
    throw upstream();
  }
  return data;
}

async function updateTag(client, id, row) {
  const { data, error } = await client.from("tags").update(row).eq("id", id).select("*").maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function deleteTag(client, id) {
  const { data, error } = await client.from("tags").delete().eq("id", id).select("slug").maybeSingle();
  if (error) throw upstream();
  return data || null;
}

// ---------------------------------------------------------------------------
// Publishers
// ---------------------------------------------------------------------------

async function listEnabledPublishers(client) {
  const { data, error } = await client.from("publishers").select("*").eq("enabled", true).order("name");
  if (error) throw upstream();
  return data || [];
}

async function listPublishers(client) {
  const { data, error } = await client.from("publishers").select("*").order("name");
  if (error) throw upstream();
  return data || [];
}

function publisherOptions(client) {
  return client.from("publishers").select("id, slug, name");
}

async function countsByPublisher(client, { publishedOnly = false } = {}) {
  let query = client.from("templates").select("id, publisher_id");
  if (publishedOnly) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw upstream();
  const counts = new Map();
  for (const row of data || []) {
    if (!row.publisher_id) continue;
    counts.set(row.publisher_id, (counts.get(row.publisher_id) || 0) + 1);
  }
  return counts;
}

async function findPublisherBySlug(client, slug) {
  const { data, error } = await client.from("publishers").select("id").eq("slug", slug).maybeSingle();
  if (error) throw upstream();
  return data?.id || null;
}

async function insertPublisher(client, row, { columns = "*" } = {}) {
  const { data, error } = await client.from("publishers").insert(row).select(columns).single();
  if (error) {
    if (error.code === "23505") throw conflict("A publisher with this slug already exists.");
    throw upstream();
  }
  return data;
}

/**
 * Insert a publisher, tolerating a concurrent insert of the same slug: the
 * application-level slug check can race with another approval, so the unique
 * index is the real guard and the loser reads the winner's row back.
 */
async function insertPublisherIfAbsent(client, row) {
  const { data, error } = await client.from("publishers").insert(row).select("id").single();
  if (data) return data.id;
  if (error?.code === "23505") return (await findPublisherBySlug(client, row.slug)) || null;
  if (error) throw upstream();
  return null;
}

async function updatePublisher(client, id, row) {
  const { data, error } = await client
    .from("publishers").update(row).eq("id", id).select("*").maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function deletePublisher(client, id) {
  const { data, error } = await client.from("publishers").delete().eq("id", id).select("slug").maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function publisherTemplateIds(client, publisherId) {
  const { data, error } = await client.from("templates").select("id").eq("publisher_id", publisherId);
  if (error) throw upstream();
  return (data || []).map((row) => row.id);
}

export {
  allTagLinks,
  categoryOptions,
  countRows,
  countsByCategory,
  countsByPublisher,
  deleteCategory,
  deletePublisher,
  deleteTag,
  findCategoryBySlug,
  findPublisherBySlug,
  insertCategory,
  insertPublisher,
  insertPublisherIfAbsent,
  insertTag,
  listCategories,
  listEnabledCategories,
  listEnabledPublishers,
  listPublishers,
  listTags,
  publishedInCategory,
  publishedTemplateIds,
  publisherOptions,
  publisherTemplateIds,
  resolveId,
  tagLinkCounts,
  tagOptions,
  toCategoryRow,
  toPublisherRow,
  updateCategory,
  updatePublisher,
  updateTag,
};

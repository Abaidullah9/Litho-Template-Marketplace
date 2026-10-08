import { conflict, notFound, upstream } from "../errors.js";
// `slugify` mirrors the SQL slugify() so slugs satisfy the database check constraint.
import { slugify } from "../validation.js";

/** Public catalogue ordering. `published_at` is never null for published rows. */
const PUBLIC_SORTS = {
  newest: { column: "published_at", ascending: false },
  oldest: { column: "published_at", ascending: true },
  name: { column: "name", ascending: true },
  views: { column: "views", ascending: false },
  downloads: { column: "downloads", ascending: false },
};

/** Admin table ordering, which also covers not-yet-published drafts. */
const ADMIN_SORTS = {
  newest: ["created_at", false],
  oldest: ["created_at", true],
  name: ["name", true],
  views: ["views", false],
  downloads: ["downloads", false],
  updated: ["updated_at", false],
};

function requireRow(row, message = "Resource not found.") {
  if (!row) throw notFound(message);
  return row;
}

/**
 * Published catalogue page for the public API.
 *
 * Taxonomy slugs are resolved by the controller into `categoryId`,
 * `publisherId` and `templateIds` before this runs.
 */
async function listPublished(client, {
  q = "",
  categoryId = null,
  publisherId = null,
  templateIds = null,
  featured = "",
  verified = "",
  sort = "newest",
  page = 1,
  perPage = 24,
} = {}) {
  const ordering = PUBLIC_SORTS[sort] || PUBLIC_SORTS.newest;
  let query = client.from("templates").select("*", { count: "exact" }).eq("status", "published");

  if (q) query = query.ilike("search_text", likePattern(q));
  if (categoryId) query = query.eq("category_id", categoryId);
  if (publisherId) query = query.eq("publisher_id", publisherId);
  if (Array.isArray(templateIds)) query = query.in("id", templateIds);
  if (featured === "true") query = query.eq("featured", true);
  if (verified === "true") query = query.eq("verified", true);

  query = query
    .order(ordering.column, { ascending: ordering.ascending, nullsFirst: false })
    .order("slug", { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, error, count } = await query;
  if (error) throw upstream();
  return { rows: data || [], total: count || 0 };
}

/** Admin table page, including drafts, with optional filters. */
async function listAdmin(client, {
  q = "",
  status = "",
  categoryId = null,
  publisherId = null,
  verified = "",
  featured = "",
  sort = "newest",
  page = 1,
  perPage = 20,
} = {}) {
  let query = client.from("templates").select("*", { count: "exact" });
  if (q) query = query.ilike("search_text", likePattern(q));
  if (status) query = query.eq("status", String(status));
  if (categoryId) query = query.eq("category_id", categoryId);
  if (publisherId) query = query.eq("publisher_id", publisherId);
  if (verified === "true") query = query.eq("verified", true);
  if (verified === "false") query = query.eq("verified", false);
  if (featured === "true") query = query.eq("featured", true);
  if (featured === "false") query = query.eq("featured", false);

  const [column, ascending] = ADMIN_SORTS[sort] || ADMIN_SORTS.newest;
  query = query.order(column, { ascending }).order("slug", { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, error, count } = await query;
  if (error) throw upstream();
  return { rows: data || [], total: count || 0 };
}

/** Escape LIKE wildcards so a user query cannot turn into a table scan pattern. */
function likePattern(value) {
  return `%${String(value).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Find one published template by slug, or by primary key when the identifier
 * is a UUID. A non-UUID identifier must never be compared against the uuid
 * `id` column: PostgREST rejects the whole `or=` filter with a 500.
 */
async function findPublished(client, identifier) {
  let query = client.from("templates").select("*").eq("status", "published");
  query = UUID_PATTERN.test(identifier)
    ? query.or(`slug.eq.${identifier},id.eq.${identifier}`)
    : query.eq("slug", identifier);
  const { data, error } = await query.maybeSingle();
  if (error) throw upstream();
  return data || null;
}

/** Minimal identity lookup used before recording an analytics event. */
async function findIdentity(client, identifier) {
  const lookup = client.from("templates").select("id, slug, status");
  const { data, error } = await (UUID_PATTERN.test(identifier)
    ? lookup.or(`slug.eq.${identifier},id.eq.${identifier}`)
    : lookup.eq("slug", identifier)
  ).maybeSingle();
  if (error) throw upstream();
  return data || null;
}

/**
 * Record an event row and bump the denormalised counter.
 *
 * The RPC helper may not be installed on older databases, so a read-modify-write
 * update is used as a fallback and the event insert alone never fails the call.
 */
async function recordStatEvent(client, { templateId, type }) {
  const column = type === "download" ? "downloads" : "views";
  const [{ error: eventError }, { error: counterError }] = await Promise.all([
    client.from("analytics_events").insert({ template_id: templateId, event_type: type }),
    client.rpc("increment_template_stat", { template_id: templateId, stat: column }),
  ]).catch(() => [{ error: null }, { error: null }]);

  if (!eventError && !counterError) return;

  const { data: current, error: readError } = await client
    .from("templates").select(column).eq("id", templateId).maybeSingle();
  if (readError) throw upstream();
  const { error: updateError } = await client
    .from("templates")
    .update({ [column]: Number(current?.[column] || 0) + 1 })
    .eq("id", templateId);
  if (updateError) throw upstream();
}

async function findById(client, id) {
  const { data, error } = await client.from("templates").select("*").eq("id", id).maybeSingle();
  if (error) throw upstream();
  return requireRow(data, "Template not found.");
}

async function insert(client, payload) {
  const row = {
    ...toTemplateRow(payload),
    verified: payload.verified,
    verification_status: payload.verified ? "verified" : "unverified",
    verification_method: payload.verified ? "manual" : null,
    verified_at: payload.verified ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
  };
  if (!row.verification_method) delete row.verification_method;
  const { data, error } = await client.from("templates").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") {
      throw conflict(`The slug "${row.slug}" is already taken.`, { slug: "Choose a different slug." });
    }
    throw upstream();
  }
  return data;
}

async function update(client, id, payload, existing) {
  const { data, error } = await client
    .from("templates")
    .update(toTemplateRow(payload, existing))
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw upstream();
  return requireRow(data, "Template not found.");
}

async function remove(client, id) {
  const { error } = await client.from("templates").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw conflict("This template is referenced by other records and cannot be deleted.");
    }
    throw upstream();
  }
}

async function updateMany(client, ids, patch) {
  const { data, error } = await client
    .from("templates").update(patch).in("id", ids).select("id, slug, status, featured");
  if (error) throw upstream();
  return data || [];
}

async function deleteMany(client, ids) {
  const { data, error } = await client.from("templates").delete().in("id", ids).select("id, slug");
  if (error) throw upstream();
  return data || [];
}

async function patchOne(client, id, patch) {
  const { data, error } = await client
    .from("templates").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) throw upstream();
  return requireRow(data, "Template not found.");
}

async function count(client, filters = {}) {
  let query = client.from("templates").select("id", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
  const { count: rows, error } = await query;
  if (error) throw upstream();
  return rows || 0;
}

/** Published-only highlights used by the dashboard and analytics screens. */
function topBy(client, column, limit) {
  return client
    .from("templates")
    .select("id, slug, name, views, downloads, status")
    .eq("status", "published")
    .order(column, { ascending: false })
    .limit(limit);
}

function recent(client, limit) {
  return client
    .from("templates")
    .select("id, slug, name, status, featured, verified, views, downloads, created_at, category_id")
    .order("created_at", { ascending: false })
    .limit(limit);
}

async function statTotals(client) {
  const { data, error } = await client.from("templates").select("views, downloads, status");
  if (error) throw upstream();
  return data || [];
}

/**
 * Reconcile a template's tag links with the submitted names, creating any tag
 * the marketplace has not seen yet.
 */
async function syncTags(client, templateId, names = []) {
  const { data: existingLinks, error: readError } = await client
    .from("template_tags").select("tag_id").eq("template_id", templateId);
  if (readError) throw upstream();
  const currentIds = new Set((existingLinks || []).map((link) => link.tag_id));

  const wantedIds = new Set();
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const { data: found, error: findError } = await client
      .from("tags").select("id").eq("slug", slug).maybeSingle();
    if (findError) throw upstream();
    let tagId = found?.id;
    if (!tagId) {
      const { data: created, error: createError } = await client
        .from("tags").insert({ slug, name }).select("id").single();
      if (createError) {
        if (createError.code === "23505") {
          const { data: raced } = await client.from("tags").select("id").eq("slug", slug).maybeSingle();
          tagId = raced?.id;
        } else throw upstream();
      } else tagId = created.id;
    }
    if (tagId) wantedIds.add(tagId);
  }

  const toRemove = [...currentIds].filter((id) => !wantedIds.has(id));
  const toAdd = [...wantedIds].filter((id) => !currentIds.has(id));

  if (toRemove.length) {
    const { error } = await client.from("template_tags").delete()
      .eq("template_id", templateId).in("tag_id", toRemove);
    if (error) throw upstream();
  }
  if (toAdd.length) {
    const { error } = await client.from("template_tags").insert(
      toAdd.map((tagId) => ({ template_id: templateId, tag_id: tagId })),
    );
    if (error) throw upstream();
  }
}

async function tagNamesFor(client, templateId) {
  const { data: links, error } = await client.from("template_tags").select("tag_id").eq("template_id", templateId);
  if (error) throw upstream();
  if (!links?.length) return [];
  const { data: tags, error: tagsError } = await client
    .from("tags").select("name").in("id", links.map((link) => link.tag_id));
  if (tagsError) throw upstream();
  return (tags || []).map((tag) => tag.name);
}

function lookupMaps(categories = [], publishers = [], tags = [], links = []) {
  const categoryById = new Map(categories.map((row) => [row.id, row]));
  const publisherById = new Map(publishers.map((row) => [row.id, row]));
  const tagById = new Map(tags.map((row) => [row.id, row]));
  const tagsByTemplate = new Map();
  for (const link of links) {
    const tag = tagById.get(link.tag_id);
    if (!tag) continue;
    const list = tagsByTemplate.get(link.template_id) || [];
    list.push(tag.name);
    tagsByTemplate.set(link.template_id, list);
  }
  return { categoryById, publisherById, tagsByTemplate };
}

/** Validated payload -> database row. `existing` preserves publish metadata. */
function toTemplateRow(payload, existing = null) {
  return {
    slug: payload.slug,
    name: payload.name,
    description: payload.description,
    long_description: payload.longDescription,
    publisher_id: payload.publisherId,
    category_id: payload.categoryId,
    version: payload.version,
    license: payload.license,
    repository_url: payload.repositoryUrl || null,
    documentation_url: payload.documentationUrl || null,
    download_url: payload.downloadUrl || null,
    preview_image: payload.previewImage || null,
    preview_images: payload.previewImages,
    sample_file: payload.sampleFile || null,
    status: payload.status,
    featured: payload.featured,
    ...(existing ? {} : { verified: payload.verified }),
    published_at: payload.status === "published"
      ? (existing?.published_at || new Date().toISOString())
      : existing?.published_at || null,
    metadata: payload.metadata,
  };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export {
  ADMIN_SORTS,
  PUBLIC_SORTS,
  UUID_PATTERN,
  count,
  deleteMany,
  findById,
  findIdentity,
  findPublished,
  insert,
  likePattern,
  listAdmin,
  listPublished,
  lookupMaps,
  patchOne,
  recent,
  recordStatEvent,
  remove,
  requireRow,
  statTotals,
  syncTags,
  tagNamesFor,
  toTemplateRow,
  topBy,
  update,
  updateMany,
};

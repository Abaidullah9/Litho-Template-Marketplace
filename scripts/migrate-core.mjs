import { isValidSlug, slugify } from "../server/validation.js";

/**
 * Pure conversion layer for the existing Litho registry/catalog.
 *
 *   Litho plugin record ──▶ template marketplace row
 *   plugin category        ──▶ template category   (name preserved)
 *   plugin tag             ──▶ template tag        (name preserved)
 *   plugin author          ──▶ template publisher  (name preserved)
 *   plugin links           ──▶ repository / documentation / download links
 *
 * Only fields that exist in the source (or are meaningfully derivable) are
 * mapped. Nothing is invented: unknown values stay null/empty.
 */

const BATCH_SIZE = 400;

export function chunk(items, size = BATCH_SIZE) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) batches.push(items.slice(index, index + size));
  return batches;
}

/** Preview paths in the catalog are site-relative ("assets/img/…"). */
export function previewUrl(path) {
  if (!path || typeof path !== "string") return null;
  const clean = path.trim().replace(/^\/+/, "");
  if (!clean) return null;
  return `/${clean}`;
}

export function mapPluginToTemplate(plugin, { now = new Date().toISOString() } = {}) {
  const failures = [];
  if (!plugin || typeof plugin !== "object") return { failures: ["record is not an object"] };
  if (!plugin.id) failures.push("missing plugin id");
  if (!plugin.name) failures.push("missing plugin name");
  if (failures.length) return { failures };

  const slug = slugify(String(plugin.id));
  if (!isValidSlug(slug)) failures.push(`id "${plugin.id}" cannot become a usable slug`);
  if (slug.length > 80) failures.push(`id "${plugin.id}" produces an oversized slug`);
  if (failures.length) return { failures, slug };

  const verified = plugin.verificationStatus === "verified";
  const addedAt = plugin.addedAt || plugin.listedAt || now;
  const publishedAt = plugin.listedAt || plugin.addedAt || now;
  const detailPreview = previewUrl(plugin.previewImage);
  const thumbnailPreview = previewUrl(plugin.previewThumbnail);

  const row = {
    slug,
    name: String(plugin.name).trim().slice(0, 160),
    description: String(plugin.description || "").trim().slice(0, 600),
    long_description: "",
    version: String(plugin.version || "1.0.0").trim().slice(0, 32),
    license: String(plugin.license || "").trim().slice(0, 80),
    repository_url: plugin.repo ? String(plugin.repo).trim() : null,
    documentation_url: null,
    download_url: null,
    preview_image: detailPreview || thumbnailPreview,
    preview_images: [...new Set([detailPreview, thumbnailPreview].filter(Boolean))],
    sample_file: null,
    status: "published",
    verified,
    verification_status: verified ? "verified" : "unverified",
    verification_method: "manual",
    verification_score: null,
    verification_reason: verified ? "Carried over from the verified Litho listing snapshot." : null,
    verified_at: verified ? (plugin.listedAt || addedAt) : null,
    verification_metadata: { migratedFrom: "litho-registry" },
    featured: false,
    views: 0,
    downloads: 0,
    source: "litho-registry",
    metadata: {
      migratedFrom: "litho-registry",
      sourceId: plugin.id,
      sourceKind: plugin.kind || null,
      sourceStars: Number.isFinite(Number(plugin.stars)) ? Number(plugin.stars) : null,
      sourceStatus: plugin.status || null,
      sourceSourceType: plugin.sourceType || null,
      sourceVerificationStatus: plugin.verificationStatus || null,
      sourceRepositoryUpdated: plugin.repositoryUpdatedAt || null,
    },
    created_at: addedAt,
    updated_at: now,
    published_at: publishedAt,
  };

  return {
    row,
    category: typeof plugin.category === "string" && plugin.category.trim() ? plugin.category.trim() : null,
    publisher: typeof plugin.author === "string" && plugin.author.trim() ? plugin.author.trim() : null,
    tags: Array.isArray(plugin.tags) ? plugin.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 10) : [],
    failures: [],
  };
}

/**
 * Build a complete migration plan from a catalog document.
 * Deterministic and side-effect free so tests can assert on it directly.
 *
 * @param {{ plugins: object[] }} catalog
 * @param {{ existingSlugs?: Set<string>, existingCategorySlugs?: Set<string>,
 *           existingPublisherSlugs?: Set<string>, existingTagSlugs?: Set<string>,
 *           status?: string, limit?: number, now?: string }} options
 */
export function planMigration(catalog, options = {}) {
  const {
    existingSlugs = new Set(),
    existingCategorySlugs = new Set(),
    existingPublisherSlugs = new Set(),
    existingTagSlugs = new Set(),
    status = "published",
    limit = 0,
    now = new Date().toISOString(),
  } = options;

  const plugins = Array.isArray(catalog?.plugins) ? catalog.plugins : [];
  const categories = new Map();
  const publishers = new Map();
  const tags = new Map();
  const templates = [];
  const links = [];
  const skipped = [];
  const failures = [];

  const consider = (map, value) => {
    if (!value) return;
    const slug = slugify(value);
    if (!isValidSlug(slug) || map.has(slug) || map.has(value)) return;
    map.set(value, { slug, name: String(value).slice(0, 80) });
  };

  const selected = typeof limit === "number" && limit > 0 ? plugins.slice(0, limit) : plugins;

  for (const plugin of selected) {
    const mapped = mapPluginToTemplate(plugin, { now });
    if (mapped.failures.length) {
      failures.push({ id: plugin?.id || "unknown", reasons: mapped.failures });
      continue;
    }
    if (existingSlugs.has(mapped.row.slug)) {
      skipped.push({ slug: mapped.row.slug, reason: "already migrated" });
      continue;
    }

    const categoryName = mapped.category;
    const publisherName = mapped.publisher;
    if (categoryName) consider(categories, categoryName);
    else consider(categories, "Other");
    if (publisherName) consider(publishers, publisherName);
    for (const tagName of mapped.tags) consider(tags, tagName);

    const row = { ...mapped.row, status };
    templates.push(row);
    links.push({
      slug: row.slug,
      category: categoryName || "Other",
      publisher: publisherName || null,
      tags: mapped.tags.map((tagName) => tags.get(tagName)?.slug).filter(Boolean),
    });
  }

  const newCategories = [...categories.values()].filter((item) => !existingCategorySlugs.has(item.slug));
  const newPublishers = [...publishers.values()].filter((item) => !existingPublisherSlugs.has(item.slug));
  const newTags = [...tags.values()].filter((item) => !existingTagSlugs.has(item.slug));

  return {
    total: plugins.length,
    selected: selected.length,
    templates,
    links,
    categories: newCategories,
    publishers: newPublishers,
    tags: newTags,
    allCategories: [...categories.values()],
    allPublishers: [...publishers.values()],
    allTags: [...tags.values()],
    skipped,
    failures,
    batchSize: BATCH_SIZE,
  };
}

/** Load and normalise the source catalog document. */
export function readCatalogDocument(document) {
  const plugins = Array.isArray(document?.plugins)
    ? document.plugins
    : Array.isArray(document)
      ? document
      : [];
  return {
    generatedAt: document?.generatedAt || null,
    plugins: plugins.filter((plugin) => plugin && typeof plugin === "object"),
  };
}

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { isValidUrl, slugify } from "../validation.js";

export const REGISTRY_SCHEMA_VERSION = 1;
export const REGISTRY_KIND = "template-marketplace-registry";

const ACCENTS = ["lime", "violet", "amber", "cyan", "coral", "blue", "mint", "rose"];

export function accentFor(value) {
  const slug = String(value || "");
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export function initialsFor(name) {
  const words = String(name || "").trim().split(/[\s._-]+/).filter(Boolean);
  if (!words.length) return "TM";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function dateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Read every row of a table. supabase-js caps a single select at 1000 rows,
 * so page through with range headers until a short page comes back.
 */
async function fetchAllPages(supabase, table, query) {
  const pageSize = 1000;
  const all = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await query(supabase.from(table)).range(from, from + pageSize - 1);
    if (error) throw new Error(`Unable to read ${table} from Supabase: ${error.message}`);
    all.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return all;
}

/** Read the taxonomy (categories, tags, publishers and their links). */
export async function fetchTaxonomy(supabase) {
  const [categories, tags, publishers, links] = await Promise.all([
    fetchAllPages(supabase, "categories", (q) => q.select("*").order("sort_order", { ascending: true }).order("name", { ascending: true })),
    fetchAllPages(supabase, "tags", (q) => q.select("*").order("name", { ascending: true })),
    fetchAllPages(supabase, "publishers", (q) => q.select("*").order("name", { ascending: true })),
    fetchAllPages(supabase, "template_tags", (q) => q.select("template_id, tag_id")),
  ]);

  return { categories, tags, publishers, links };
}

/** Turn raw template rows into public catalog entries using one taxonomy. */
export function hydrateTemplates(templates, taxonomy) {
  const categoryById = new Map(taxonomy.categories.map((category) => [category.id, category]));
  const publisherById = new Map(taxonomy.publishers.map((publisher) => [publisher.id, publisher]));
  const tagById = new Map(taxonomy.tags.map((tag) => [tag.id, tag]));
  const tagsByTemplate = new Map();
  for (const link of taxonomy.links) {
    const tag = tagById.get(link.tag_id);
    if (!tag) continue;
    const list = tagsByTemplate.get(link.template_id) || [];
    list.push(tag);
    tagsByTemplate.set(link.template_id, list);
  }
  return templates.map((template) => toCatalogEntry(template, {
    category: categoryById.get(template.category_id) || null,
    publisher: publisherById.get(template.publisher_id) || null,
    tags: (tagsByTemplate.get(template.id) || []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export async function fetchRegistryData(supabase) {
  const [templates, taxonomy] = await Promise.all([
    fetchAllPages(supabase, "templates", (q) => q.select("*").eq("status", "published").order("published_at", { ascending: false })),
    fetchTaxonomy(supabase),
  ]);
  return { templates, ...taxonomy };
}

/** Public catalog entry: only fields a marketplace visitor may see. */
export function toCatalogEntry(template, { category, publisher, tags }) {
  return {
    id: template.slug,
    slug: template.slug,
    name: template.name,
    description: template.description || "",
    longDescription: template.long_description || "",
    publisher: publisher
      ? { slug: publisher.slug, name: publisher.name, websiteUrl: publisher.website_url || null, avatarUrl: publisher.avatar_url || null }
      : null,
    author: publisher ? publisher.name : "Community",
    category: category ? category.name : "Other",
    categoryName: category ? category.name : "Other",
    kind: category ? category.name : "Other",
    tags: tags.map((tag) => tag.name),
    version: template.version || "1.0.0",
    license: template.license || "",
    repositoryUrl: template.repository_url || "",
    documentationUrl: template.documentation_url || "",
    downloadUrl: template.download_url || "",
    repo: template.repository_url || "",
    previewImage: template.preview_image || "",
    previewImages: Array.isArray(template.preview_images) ? template.preview_images : [],
    previewThumbnail: template.preview_image || "",
    sampleFile: template.sample_file || "",
    accent: accentFor(template.slug),
    initials: initialsFor(template.name),
    status: "published",
    featured: Boolean(template.featured),
    verified: Boolean(template.verified),
    verificationStatus: template.verified ? "verified" : "unverified",
    verificationMethod: template.verification_method || "manual",
    verifiedAt: dateOrNull(template.verified_at),
    views: Number(template.views || 0),
    downloads: Number(template.downloads || 0),
    createdAt: dateOrNull(template.created_at),
    updatedAt: dateOrNull(template.updated_at),
    publishedAt: dateOrNull(template.published_at) || dateOrNull(template.created_at),
    addedAt: dateOrNull(template.published_at) || dateOrNull(template.created_at),
    listedAt: dateOrNull(template.published_at) || dateOrNull(template.created_at),
    sourceType: "community",
    builtIn: false,
    placeholder: false,
    installCommand: "",
  };
}

export function buildRegistry(data) {
  const categories = data.categories.filter((category) => category.enabled !== false);
  const publishers = data.publishers.filter((publisher) => publisher.enabled !== false);
  const templates = hydrateTemplates(data.templates, {
    categories,
    publishers,
    tags: data.tags,
    links: data.links,
  }).sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")));

  const countFor = (predicate) => templates.filter(predicate).length;

  const categoryList = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description || "",
    templateCount: countFor((entry) => entry.category.slug === category.slug),
  })).filter((category) => category.templateCount > 0 || categories.length <= 40);

  const publishedIds = new Set(data.templates.filter((item) => item.status === "published").map((item) => item.id));
  const tagCounts = new Map();
  for (const link of data.links) {
    if (!publishedIds.has(link.template_id)) continue;
    tagCounts.set(link.tag_id, (tagCounts.get(link.tag_id) || 0) + 1);
  }
  const tagList = data.tags
    .filter((tag) => (tagCounts.get(tag.id) || 0) > 0)
    .map((tag) => ({
      slug: tag.slug,
      name: tag.name,
      templateCount: tagCounts.get(tag.id),
    }));

  // Enabled publishers stay in the directory even before their first
  // published template, so admin-created publishers are browsable.
  const publisherList = publishers.map((publisher) => ({
    slug: publisher.slug,
    name: publisher.name,
    description: publisher.description || "",
    websiteUrl: publisher.website_url || null,
    avatarUrl: publisher.avatar_url || null,
    templateCount: countFor((entry) => entry.publisher && entry.publisher.slug === publisher.slug),
  }));

  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    kind: REGISTRY_KIND,
    generatedAt: new Date().toISOString(),
    counts: {
      templates: templates.length,
      categories: categoryList.length,
      tags: tagList.length,
      publishers: publisherList.length,
      featured: countFor((entry) => entry.featured),
      verified: countFor((entry) => entry.verified),
      views: templates.reduce((sum, entry) => sum + entry.views, 0),
      downloads: templates.reduce((sum, entry) => sum + entry.downloads, 0),
    },
    categories: categoryList,
    tags: tagList,
    publishers: publisherList,
    templates,
  };
}

/** Validate a generated registry. Returns a list of human-readable problems. */
export function validateRegistry(registry) {
  const problems = [];
  const push = (message) => problems.push(message);

  if (!registry || typeof registry !== "object") return ["Registry is not an object."];
  if (registry.kind !== REGISTRY_KIND) push(`kind must be "${REGISTRY_KIND}".`);
  if (registry.schemaVersion !== REGISTRY_SCHEMA_VERSION) push(`schemaVersion must be ${REGISTRY_SCHEMA_VERSION}.`);
  if (!Array.isArray(registry.templates)) { push("templates must be an array."); return problems; }
  if (!Array.isArray(registry.categories)) push("categories must be an array.");
  if (!Array.isArray(registry.tags)) push("tags must be an array.");
  if (!Array.isArray(registry.publishers)) push("publishers must be an array.");

  const seen = new Set();
  const categorySlugs = new Set((registry.categories || []).map((item) => item.slug));
  const categoryNames = new Set((registry.categories || []).map((item) => item.name));
  const publisherSlugs = new Set((registry.publishers || []).map((item) => item.slug));

  for (const entry of registry.templates) {
    const label = entry.slug || entry.name || "unknown";
    if (!entry.slug || entry.slug !== slugify(entry.slug)) push(`Template "${label}" has an invalid slug.`);
    if (seen.has(entry.slug)) push(`Duplicate template slug "${entry.slug}".`);
    seen.add(entry.slug);
    if (!entry.name) push(`Template "${entry.slug}" is missing a name.`);
    if (entry.status && entry.status !== "published") push(`Template "${entry.slug}" is not published.`);
    for (const field of ["repositoryUrl", "documentationUrl", "downloadUrl", "previewImage", "sampleFile"]) {
      if (entry[field] && !isValidUrl(entry[field])) push(`Template "${entry.slug}" has an invalid ${field}.`);
    }
    if (entry.category && !categoryNames.has(entry.category)) {
      push(`Template "${entry.slug}" references unknown category "${entry.category}".`);
    }
    if (entry.publisher && entry.publisher.name && !publisherSlugs.has(entry.publisher.slug)) {
      push(`Template "${entry.slug}" references unknown publisher "${entry.publisher.slug}".`);
    }
  }

  return problems;
}

/** Write the registry atomically so the marketplace never reads a half file. */
export async function writeRegistry(registry, targetPath) {
  const directory = path.dirname(targetPath);
  await mkdir(directory, { recursive: true });
  const temporary = `${targetPath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await rename(temporary, targetPath);
}

export async function readRegistry(targetPath) {
  try {
    return JSON.parse(await readFile(targetPath, "utf8"));
  } catch {
    return null;
  }
}

/** Full generation pipeline used by the CLI and the admin registry endpoint. */
export async function generateRegistry(supabase, { targetPath, now = new Date() } = {}) {
  const data = await fetchRegistryData(supabase);
  const registry = buildRegistry(data);
  registry.generatedAt = now.toISOString();
  const problems = validateRegistry(registry);
  if (problems.length) {
    const error = new Error(`Registry validation failed:\n- ${problems.join("\n- ")}`);
    error.problems = problems;
    throw error;
  }
  if (targetPath) await writeRegistry(registry, targetPath);
  return registry;
}

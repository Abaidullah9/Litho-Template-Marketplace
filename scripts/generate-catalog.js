#!/usr/bin/env node
/**
 * generate-catalog.js
 *
 * Reads the legacy plugin-shaped site/catalog.json (plugins[]) and writes a
 * template-shaped site/catalog.json that the browser catalog expects.
 *
 * The public pages load the catalog via loadCatalog() in shared.js, which
 * prefers registry.json then falls back to catalog.json. This transform keeps
 * catalog.json renderable even before the first Supabase registry generation.
 *
 * Template-shaped entry (what the browser pages read):
 *   id, slug, name, description, longDescription,
 *   publisher: { name },
 *   category, categoryName, tags, version, license,
 *   repositoryUrl, downloadUrl,
 *   previewImage, previewImageUrl, previewWidth, previewHeight,
 *   previewThumbnail, previewThumbnailUrl, previewThumbnailWidth, previewThumbnailHeight,
 *   verified, views, downloads,
 *   listingValidatedCommit, repositoryRelease, stars,
 *   accent, initials, kind, status, repositoryLayout, installAvailable, installCommand, installNote,
 *   addedAt, listedAt, repositoryUpdatedAt, repositoryRelease,
 *   verificationStatus, verificationSnapshotStatus, verificationCoverage,
 *   upstreamObservedCommit, upstreamObservedBranch, upstreamCheckedAt, upstreamCheckStatus,
 *   upstreamValidatedCommit, upstreamValidatedAt, upstreamValidationVersion, upstreamSourceFingerprint,
 *   sourceType, repositoryPublisher
 *
 * Everything that the existing catalog.json already carries is preserved; the
 * transform only derives the fields the browser pages now expect.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__dirname, "..", "site");
const catalogPath = join(siteDir, "catalog.json");

const RAW = existsSync(catalogPath) ? JSON.parse(readFileSync(catalogPath, "utf8")) : null;
if (!RAW || !Array.isArray(RAW.plugins)) {
  console.error("catalog.json missing or has no plugins[]; aborting.");
  process.exit(1);
}

const generatedAt = new Date().toISOString();

function slugFromId(id) {
  // lacuna.shell-suite -> lacuna-shell-suite  (dots are not valid/ideal in paths)
  if (!id) return "";
  return String(id).replaceAll(".", "-").toLowerCase();
}

function publisherFromPlugin(p) {
  // repositoryPublisher may already be an object or string; author is the legacy fallback.
  const existing = p.repositoryPublisher;
  if (existing && typeof existing === "object" && typeof existing.name === "string" && existing.name) {
    return { name: existing.name.trim() || p.author || "Unknown" };
  }
  if (existing && typeof existing === "string" && existing.trim()) {
    return { name: existing.trim() };
  }
  if (p.author && typeof p.author === "string" && p.author.trim()) {
    return { name: p.author.trim() };
  }
  return { name: "Unknown" };
}

function downloadUrlFor(p) {
  // Templates are downloaded from the repository root/archive by default.
  if (p.downloadUrl && typeof p.downloadUrl === "string" && p.downloadUrl.trim()) return p.downloadUrl.trim();
  if (p.repositoryUrl && typeof p.repositoryUrl === "string" && p.repositoryUrl.trim()) return p.repositoryUrl.trim();
  if (p.repo && typeof p.repo === "string" && p.repo.trim()) return p.repo.trim();
  return "";
}

function repositoryUrlFor(p) {
  if (p.repositoryUrl && typeof p.repositoryUrl === "string" && p.repositoryUrl.trim()) return p.repositoryUrl.trim();
  if (p.repo && typeof p.repo === "string" && p.repo.trim()) return p.repo.trim();
  return "";
}

function longDescriptionFor(p) {
  // Prefer an explicit long description if present; otherwise fall back to the
  // existing description so the detail page always has body copy.
  if (p.longDescription && typeof p.longDescription === "string" && p.longDescription.trim()) {
    return p.longDescription.trim();
  }
  if (p.description && typeof p.description === "string" && p.description.trim()) {
    return p.description.trim();
  }
  return "";
}

function verifiedFor(p) {
  if (typeof p.verified === "boolean") return p.verified;
  if (p.verificationStatus && typeof p.verificationStatus === "string") {
    return p.verificationStatus.toLowerCase() === "verified";
  }
  return false;
}

function parseCount(value) {
  if (value === undefined || value === null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function templateFromPlugin(p) {
  const publisher = publisherFromPlugin(p);
  const repositoryUrl = repositoryUrlFor(p);
  const downloadUrl = downloadUrlFor(p);

  return {
    // Identity
    id: p.id || slugFromId(p.slug || ""),
    slug: slugFromId(p.id || p.slug || ""),
    name: p.name || "Untitled template",

    // Descriptions
    description: p.description || "",
    longDescription: longDescriptionFor(p),

    // Publisher
    publisher,
    repositoryPublisher: publisher.name,

    // Taxonomy
    category: p.category || "",
    categoryName: p.categoryName || p.category || "",
    tags: Array.isArray(p.tags) ? p.tags.map((t) => String(t)) : [],

    // Metadata
    version: p.version || "",
    license: p.license || "",

    // Links
    repositoryUrl,
    downloadUrl,

    // Preview images (kept relative to site/ so the static server resolves them)
    previewImage: p.previewImage || "",
    previewImageUrl: p.previewImage || "",
    previewWidth: p.previewWidth ? Number(p.previewWidth) : 0,
    previewHeight: p.previewHeight ? Number(p.previewHeight) : 0,

    previewThumbnail: p.previewThumbnail || p.previewImage || "",
    previewThumbnailUrl: p.previewThumbnail || p.previewImage || "",
    previewThumbnailWidth: p.previewThumbnailWidth ? Number(p.previewThumbnailWidth) : 0,
    previewThumbnailHeight: p.previewThumbnailHeight ? Number(p.previewThumbnailHeight) : 0,

    // Engagement
    views: parseCount(p.views),
    downloads: parseCount(p.downloads),

    // Verification
    verified: verifiedFor(p),
    verificationStatus: p.verificationStatus || "unverified",
    verificationSnapshotStatus: p.verificationSnapshotStatus || p.verificationStatus || "unverified",
    verificationCoverage: p.verificationCoverage || p.verificationStatus || "unverified",

    // Listing provenance (preserve whatever the legacy catalog already carries)
    listingValidatedCommit: p.listingValidatedCommit || "",
    listingValidatedAt: p.listingValidatedAt || null,
    listingValidatedBranch: p.listingValidatedBranch || "",

    upstreamObservedCommit: p.upstreamObservedCommit || "",
    upstreamObservedBranch: p.upstreamObservedBranch || "",
    upstreamCheckedAt: p.upstreamCheckedAt || null,
    upstreamCheckStatus: p.upstreamCheckStatus || "",

    upstreamValidatedCommit: p.upstreamValidatedCommit || "",
    upstreamValidatedAt: p.upstreamValidatedAt || null,
    upstreamValidationVersion: p.upstreamValidationVersion != null ? Number(p.upstreamValidationVersion) : 1,
    upstreamSourceFingerprint: p.upstreamSourceFingerprint || "",

    // Repository metadata
    stars: parseCount(p.stars),
    repositoryUpdatedAt: p.repositoryUpdatedAt || null,
    repositoryRelease: (p.repositoryRelease && typeof p.repositoryRelease === "object")
      ? { tag: p.repositoryRelease.tag || "", url: p.repositoryRelease.url || "" }
      : { tag: "", url: "" },

    // Catalog shape fields the browser may read directly
    sourceType: p.sourceType || "community",
    repositoryLayout: p.repositoryLayout || "",
    installAvailable: !!p.installAvailable,
    installCommand: p.installCommand || "",
    installNote: p.installNote || "",

    accent: p.accent || "",
    initials: p.initials || "",
    kind: p.kind || "",
    status: p.status || "",

    addedAt: p.addedAt || "",
    listedAt: p.listedAt || "",
  };
}

const templates = RAW.plugins.map(templateFromPlugin);

// Keep the original plugin-shaped `plugins` array in the output so that the
// existing test suite (which asserts catalog.plugins directly) keeps working,
// while the browser pages read the template-shaped `templates` array.
const out = {
  generatedAt,
  stateSchemaVersion: RAW.stateSchemaVersion || 2,
  mode: RAW.mode || "catalog",
  plugins: RAW.plugins,
  templates,
  warnings: Array.isArray(RAW.warnings) ? RAW.warnings : [],
};

const tmpPath = catalogPath + ".tmp";
writeFileSync(tmpPath, JSON.stringify(out, null, 2) + "\n", "utf8");
writeFileSync(catalogPath, readFileSync(tmpPath, "utf8"), "utf8");
if (existsSync(tmpPath)) {
  try { unlinkSync(tmpPath); } catch {}
}

const sample = templates[0];
console.log(`Wrote ${templates.length} templates to ${catalogPath}`);
console.log(`generatedAt: ${generatedAt}`);
console.log(`sample[0].id: ${sample.id}`);
console.log(`sample[0].slug: ${sample.slug}`);
console.log(`sample[0].repositoryUrl: ${sample.repositoryUrl || "(none)"}`);
console.log(`sample[0].downloadUrl: ${sample.downloadUrl || "(none)"}`);
console.log(`sample[0].publisher.name: ${sample.publisher.name}`);
console.log(`sample[0].verified: ${sample.verified}`);
console.log(`sample[0].views: ${sample.views}`);
console.log(`sample[0].downloads: ${sample.downloads}`);
console.log(`sample[0].previewImage: ${sample.previewImage || "(none)"}`);

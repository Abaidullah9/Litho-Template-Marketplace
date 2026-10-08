// Shared catalog-shape assertions.
//
// The public catalog (site/catalog.json) is produced in one of two ways:
//   1. The Supabase registry generator writes registry.json, which the server
//      serves at /registry.json and the browser prefers over catalog.json.
//   2. The legacy catalog.json is transformed by scripts/generate-catalog.js
//      into the same template-shaped schema so the site still renders before
//      the first registry generation.
//
// Every test that inspects catalog shape reads this module so a single
// transform owns the contract.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "site");
const CATALOG_PATH = path.join(SITE_DIR, "catalog.json");

export const catalog = readCatalog();
export const templates = catalog.templates;

export function readCatalog() {
  const raw = readFileSync(CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.templates)) {
    throw new Error(`catalog.json at ${CATALOG_PATH} has no templates[]`);
  }
  return parsed;
}

export function templateById(id) {
  return templates.find((t) => t.id === id || t.slug === id) || null;
}

export function templateByRepo(repo) {
  return templates.find((t) => t.repositoryUrl === repo) || null;
}

export const catalogShape = {
  // Top-level
  generatedAt: "string",
  stateSchemaVersion: "number",
  mode: "string",
  templates: "array",
  warnings: "array",

  // Per-template (template-shaped, not plugin-shaped)
  // id:        string  – stable marketplace identifier, e.g. "lacuna.shell-suite"
  // slug:      string  – derived from id, used in URLs and lookup
  // name:      string
  // description: string
  // longDescription: string
  // publisher: { name: string }
  // repositoryPublisher: string (fallback display)
  // category:  string
  // categoryName: string
  // tags:      string[]
  // version:   string
  // license:   string
  // repositoryUrl: string
  // downloadUrl: string
  // previewImage: string (relative to site/)
  // previewImageUrl: string
  // previewWidth: number
  // previewHeight: number
  // previewThumbnail: string
  // previewThumbnailUrl: string
  // previewThumbnailWidth: number
  // previewThumbnailHeight: number
  // verified: boolean
  // views: number
  // downloads: number
  // listingValidatedCommit: string
  // repositoryRelease: { tag: string, url: string }
  // stars: number
  // sourceType: string
  // repositoryLayout: string
  // installAvailable: boolean
  // installCommand: string
  // installNote: string
  // accent: string
  // initials: string
  // kind: string
  // status: string
  // addedAt: string
  // listedAt: string
  // repositoryUpdatedAt: string | null
  // verificationStatus: string
  // verificationSnapshotStatus: string
  // verificationCoverage: string
  // upstreamObservedCommit: string
  // upstreamObservedBranch: string
  // upstreamCheckedAt: string | null
  // upstreamCheckStatus: string
  // upstreamValidatedCommit: string
  // upstreamValidatedAt: string | null
  // upstreamValidationVersion: number
  // upstreamSourceFingerprint: string
};

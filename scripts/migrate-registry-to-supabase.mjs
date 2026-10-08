#!/usr/bin/env node
/**
 * Migrate the existing Litho registry/catalog into Supabase.
 *
 *   node scripts/migrate-registry-to-supabase.mjs [--dry-run] [--limit=N]
 *       [--status=published|draft] [--update] [--source=path] [--report=path]
 *
 * The script is safe to re-run: records are matched on slug and skipped (or
 * updated with --update) instead of duplicated. Failed records are reported
 * and never abort the remaining batches.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig, projectRoot, requireSupabase } from "../server/config.js";
import { createSupabase } from "../server/supabase.js";
import { slugify } from "../server/validation.js";
import { chunk, planMigration, readCatalogDocument } from "./migrate-core.mjs";

function parseArgs(argv) {
  const args = { dryRun: false, limit: 0, status: "published", update: false, report: "", source: "", strict: false };
  for (const raw of argv) {
    if (raw === "--dry-run") args.dryRun = true;
    else if (raw === "--update") args.update = true;
    else if (raw === "--strict") args.strict = true;
    else if (raw.startsWith("--limit=")) args.limit = Number(raw.slice(8)) || 0;
    else if (raw.startsWith("--status=")) args.status = raw.slice(9);
    else if (raw.startsWith("--report=")) args.report = raw.slice(9);
    else if (raw.startsWith("--source=")) args.source = raw.slice(9);
    else if (raw === "--help" || raw === "-h") args.help = true;
  }
  return args;
}

const HELP = `Migrate the existing Litho registry/catalog into Supabase.

Options:
  --dry-run           Plan and print the migration without writing
  --limit=N           Only migrate the first N records
  --status=STATUS     Template status for migrated rows (default: published)
  --update            Update rows whose slug already exists instead of skipping
  --source=PATH       Source catalog (default: site/catalog.json)
  --report=PATH       Write a JSON report of created/skipped/failed records
  --strict            Exit non-zero when any record failed
`;

async function fetchSlugs(supabase, table) {
  // supabase-js caps a single select at 1000 rows; page through with range
  // headers so existing-slug lookups see the full table.
  const pageSize = 1000;
  const all = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select("id, slug")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Unable to read ${table}: ${error.message}`);
    all.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return all;
}

async function insertBatches(supabase, table, rows) {
  const created = [];
  for (const batch of chunk(rows)) {
    const { data, error } = await supabase.from(table).insert(batch).select("id, slug");
    if (error) throw new Error(`Unable to insert into ${table}: ${error.message}`);
    created.push(...(data || []));
  }
  return created;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return 0;
  }

  const config = loadConfig();

  const sourcePath = path.resolve(projectRoot, args.source || "site/catalog.json");
  const document = JSON.parse(await readFile(sourcePath, "utf8"));
  const catalog = readCatalogDocument(document);
  if (!catalog.plugins.length) {
    console.error(`No plugin records found in ${sourcePath}.`);
    return 1;
  }

  console.log(`Source:   ${sourcePath} (${catalog.plugins.length} records${catalog.generatedAt ? `, generated ${catalog.generatedAt}` : ""})`);

  if (args.dryRun) {
    // A dry run never touches Supabase, so it works without credentials.
    const plan = planMigration(catalog, { status: args.status, limit: args.limit });
    console.log(`Mode:     dry-run (no writes)`);
    console.log(`Plan:     ${plan.templates.length} templates, ${plan.categories.length} categories, `
      + `${plan.publishers.length} publishers, ${plan.tags.length} tags`);
    console.log(`Skipped:  ${plan.skipped.length} already migrated`);
    console.log(`Failed:   ${plan.failures.length}`);
    for (const failure of plan.failures.slice(0, 10)) console.log(`  - ${failure.id}: ${failure.reasons.join("; ")}`);
    return plan.failures.length && args.strict ? 1 : 0;
  }

  requireSupabase(config);
  const supabase = createSupabase(config);
  const [existingTemplates, existingCategories, existingPublishers, existingTags] = await Promise.all([
    fetchSlugs(supabase, "templates"),
    fetchSlugs(supabase, "categories"),
    fetchSlugs(supabase, "publishers"),
    fetchSlugs(supabase, "tags"),
  ]);

  const plan = planMigration(catalog, {
    status: args.status,
    limit: args.limit,
    existingSlugs: new Set(existingTemplates.map((row) => row.slug)),
    existingCategorySlugs: new Set(existingCategories.map((row) => row.slug)),
    existingPublisherSlugs: new Set(existingPublishers.map((row) => row.slug)),
    existingTagSlugs: new Set(existingTags.map((row) => row.slug)),
  });

  console.log(`Existing: ${existingTemplates.length} templates, ${existingCategories.length} categories, `
    + `${existingPublishers.length} publishers, ${existingTags.length} tags`);
  console.log(`Plan:     ${plan.templates.length} templates, ${plan.categories.length} new categories, `
    + `${plan.publishers.length} new publishers, ${plan.tags.length} new tags, ${plan.skipped.length} skipped`);

  // Taxonomy first: templates reference category and publisher ids.
  // Source data can contain distinct names that slugify to the same slug
  // (case/punctuation differences); dedupe by slug — first occurrence wins —
  // so the slug-unique constraints cannot reject a batch.
  const uniqueBySlug = (items) => [...new Map(items.map((item) => [item.slug, item])).values()];
  const categoryRows = await insertBatches(supabase, "categories", uniqueBySlug(plan.categories).map((item) => ({
    slug: item.slug,
    name: item.name,
    description: "",
    enabled: true,
    sort_order: 100,
  })));
  const publisherRows = await insertBatches(supabase, "publishers", uniqueBySlug(plan.publishers).map((item) => ({
    slug: item.slug,
    name: item.name,
    description: "",
    enabled: true,
  })));
  const tagRows = await insertBatches(supabase, "tags", uniqueBySlug(plan.tags).map((item) => ({ slug: item.slug, name: item.name })));

  const categoryBySlug = new Map([...existingCategories, ...categoryRows].map((row) => [row.slug, row.id]));
  const publisherBySlug = new Map([...existingPublishers, ...publisherRows].map((row) => [row.slug, row.id]));
  const tagBySlug = new Map([...existingTags, ...tagRows].map((row) => [row.slug, row.id]));

  const rows = plan.templates.map((row) => ({ ...row }));
  // Attach taxonomy ids from the link plan (kept out of the pure mapper so it
  // stays deterministic for tests).
  const linkBySlug = new Map(plan.links.map((link) => [link.slug, link]));
  for (const row of rows) {
    const link = linkBySlug.get(row.slug);
    row.category_id = link ? categoryBySlug.get(slugify(link.category)) || null : null;
    row.publisher_id = link?.publisher ? publisherBySlug.get(slugify(link.publisher)) || null : null;
  }

  const createdTemplates = [];
  const failures = [...plan.failures];
  for (const batch of chunk(rows)) {
    let query = supabase.from("templates").insert(batch);
    if (args.update) query = supabase.from("templates").upsert(batch, { onConflict: "slug" });
    const { data, error } = await query.select("id, slug");
    if (error) {
      failures.push({ id: batch[0]?.slug || "batch", reasons: [error.message] });
      console.error(`  batch failed: ${error.message}`);
      continue;
    }
    createdTemplates.push(...(data || []));
  }

  const templateIdBySlug = new Map(createdTemplates.map((row) => [row.slug, row.id]));
  const linkRows = [];
  for (const link of plan.links) {
    const templateId = templateIdBySlug.get(link.slug);
    if (!templateId) continue;
    for (const tagSlug of link.tags) {
      const tagId = tagBySlug.get(tagSlug);
      if (tagId) linkRows.push({ template_id: templateId, tag_id: tagId });
    }
  }

  let linksCreated = 0;
  for (const batch of chunk(linkRows, 500)) {
    const { error } = await supabase.from("template_tags").upsert(batch, { onConflict: "template_id,tag_id" });
    if (error) {
      failures.push({ id: "template_tags", reasons: [error.message] });
      continue;
    }
    linksCreated += batch.length;
  }

  const summary = {
    source: path.relative(projectRoot, sourcePath),
    generatedAt: catalog.generatedAt,
    migratedAt: new Date().toISOString(),
    status: args.status,
    templatesCreated: createdTemplates.length,
    categoriesCreated: categoryRows.length,
    publishersCreated: publisherRows.length,
    tagsCreated: tagRows.length,
    tagLinksCreated: linksCreated,
    skipped: plan.skipped,
    failures,
  };

  console.log("");
  console.log(`Created:  ${summary.templatesCreated} templates, ${summary.categoriesCreated} categories, `
    + `${summary.publishersCreated} publishers, ${summary.tagsCreated} tags, ${summary.tagLinksCreated} tag links`);
  console.log(`Skipped:  ${summary.skipped.length} (already migrated)`);
  console.log(`Failed:   ${summary.failures.length}`);
  for (const failure of summary.failures.slice(0, 20)) console.log(`  - ${failure.id}: ${failure.reasons.join("; ")}`);

  if (args.report) {
    const reportPath = path.resolve(projectRoot, args.report);
    await writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Report:   ${path.relative(projectRoot, reportPath)}`);
  }

  return summary.failures.length && args.strict ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  });

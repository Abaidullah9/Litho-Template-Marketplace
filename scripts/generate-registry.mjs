#!/usr/bin/env node
/**
 * Generate the public marketplace registry from Supabase.
 *
 *   node scripts/generate-registry.mjs [--out=site/registry.json] [--check]
 *
 * Pipeline:  Supabase (source of truth)  →  validate  →  registry.json
 * The registry is a read-only snapshot; nothing ever writes back to Supabase
 * from this file, so Supabase always wins.
 */
import path from "node:path";
import { loadConfig, projectRoot, registryPath, requireSupabase } from "../server/config.js";
import { createSupabase } from "../server/supabase.js";
import { generateRegistry, readRegistry, validateRegistry } from "../server/services/registry.js";

function parseArgs(argv) {
  const args = { out: registryPath, check: false };
  for (const raw of argv) {
    if (raw.startsWith("--out=")) args.out = path.resolve(projectRoot, raw.slice(6));
    else if (raw === "--check") args.check = true;
    else if (raw === "--help" || raw === "-h") args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/generate-registry.mjs [--out=path] [--check]");
    return 0;
  }

  const config = loadConfig();
  requireSupabase(config);

  if (args.check) {
    const existing = await readRegistry(args.out);
    if (!existing) {
      console.error(`No registry at ${path.relative(projectRoot, args.out)}. Run \`npm run registry:generate\`.`);
      return 1;
    }
    const problems = validateRegistry(existing);
    if (problems.length) {
      console.error("Registry is invalid:");
      for (const problem of problems) console.error(`  - ${problem}`);
      return 1;
    }
    console.log(`Registry OK: ${existing.counts?.templates ?? existing.templates.length} templates, generated ${existing.generatedAt}`);
    return 0;
  }

  const started = Date.now();
  const supabase = createSupabase(config);
  try {
    const registry = await generateRegistry(supabase, { targetPath: args.out });
    const relative = path.relative(projectRoot, args.out);
    console.log(`Registry written to ${relative}`);
    console.log(`  templates:  ${registry.counts.templates} (${registry.counts.verified} verified, ${registry.counts.featured} featured)`);
    console.log(`  categories: ${registry.counts.categories}`);
    console.log(`  tags:       ${registry.counts.tags}`);
    console.log(`  publishers: ${registry.counts.publishers}`);
    console.log(`  views:      ${registry.counts.views}   downloads: ${registry.counts.downloads}`);
    console.log(`  took:       ${Date.now() - started}ms`);
    return 0;
  } catch (error) {
    console.error(error.message);
    if (error.problems) return 1;
    console.error("Registry generation failed — the previous registry.json was left untouched.");
    return 1;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`Registry generation failed: ${error.message}`);
    process.exit(1);
  });

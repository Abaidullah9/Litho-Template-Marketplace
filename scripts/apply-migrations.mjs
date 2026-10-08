#!/usr/bin/env node
/**
 * Apply the SQL migrations in supabase/migrations/ to the Supabase database.
 *
 *   node scripts/apply-migrations.mjs [--dry-run]
 *
 * Needs SUPABASE_DB_URL (Supabase → Settings → Database → Connection string →
 * URI). Statements are applied inside a transaction and recorded in
 * `_applied_migrations`, so re-running is safe.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadConfig, projectRoot } from "../server/config.js";

const MIGRATIONS_DIR = path.join(projectRoot, "supabase", "migrations");

function isPlaceholder(value) {
  return !value || /CHANGE_ME|YOUR_/.test(value);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const config = loadConfig();

  if (isPlaceholder(config.supabaseDbUrl)) {
    console.error("SUPABASE_DB_URL is not set.");
    console.error("Copy it from Supabase → Settings → Database → Connection string → URI into .env, then re-run.");
    console.error("Alternatively paste supabase/migrations/0001_template_marketplace.sql into the SQL editor.");
    return 1;
  }

  const files = (await readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith(".sql")).sort();
  if (!files.length) {
    console.error(`No migrations found in ${path.relative(projectRoot, MIGRATIONS_DIR)}.`);
    return 1;
  }

  if (dryRun) {
    console.log("Pending migration files:");
    for (const file of files) console.log(`  - ${file}`);
    return 0;
  }

  const client = new pg.Client({
    connectionString: config.supabaseDbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(
      "create table if not exists _applied_migrations (id text primary key, applied_at timestamptz not null default now())",
    );

    const { rows } = await client.query("select id from _applied_migrations");
    const applied = new Set(rows.map((row) => row.id));

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip   ${file} (already applied)`);
        continue;
      }
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`apply  ${file} …`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into _applied_migrations (id) values ($1) on conflict do nothing", [file]);
        await client.query("commit");
        ran += 1;
      } catch (error) {
        await client.query("rollback");
        throw new Error(`${file}: ${error.message}`);
      }
    }

    console.log(ran ? `Applied ${ran} migration(s).` : "Database already up to date.");
    return 0;
  } finally {
    await client.end().catch(() => {});
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  });

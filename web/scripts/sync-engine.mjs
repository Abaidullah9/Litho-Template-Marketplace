#!/usr/bin/env node
/**
 * The catalog, search and explorer engines are the behavioural source of truth for the marketplace
 * pages, so the React app imports them instead of keeping a second copy: they are already covered
 * by the test suite, and a re-implementation would drift from the deployed site.
 *
 * They are copied from `site/assets/js` on every build. The only edit is dropping the `?v=` cache
 * token from relative imports — a bundler resolves them by path, and the tokens are only there so
 * the deployed pages bust their own cache.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(webRoot, "..", "site", "assets", "js");
const targetDir = path.join(webRoot, "vendor");

/** The marketplace engines, plus the admin screens' modules (which share one shell module). */
const modules = [
  ...readdirSync(sourceDir).filter((name) => name.endsWith(".js")),
  ...readdirSync(path.join(sourceDir, "admin")).filter((name) => name.endsWith(".js")).map((name) => `admin/${name}`),
];

mkdirSync(path.join(targetDir, "admin"), { recursive: true });

const versioned = /(\.\/[A-Za-z0-9/_.-]+\.js)\?v=[\w.-]+/g;

const rewritten = [];
for (const module of modules) {
  const source = readFileSync(path.join(sourceDir, module), "utf8");
  const output = source.replace(versioned, "$1");
  const target = path.join(targetDir, module);
  const previous = (() => {
    try {
      return readFileSync(target, "utf8");
    } catch {
      return null;
    }
  })();
  if (previous !== output) rewritten.push(module);
  writeFileSync(target, output);
}

const summary = rewritten.length ? `updated ${rewritten.join(", ")}` : "already in sync";
console.log(`engine: ${summary} (${modules.length} modules)`);

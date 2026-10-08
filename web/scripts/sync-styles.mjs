#!/usr/bin/env node
/**
 * The marketplace stylesheets are the visual source of truth for the React app, so they are copied
 * from `site/assets/css` on every build instead of being maintained twice. The only edit is the
 * rewrite of the two relative asset prefixes: the app serves fonts and images from the site root
 * (`/assets/...`), where the legacy server and GitHub Pages both keep them.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(webRoot, "..", "site", "assets", "css");
const targetDir = path.join(webRoot, "styles");
const sheets = ["style.css", "admin.css", "explore.css"];

mkdirSync(targetDir, { recursive: true });

const rewritten = [];
for (const sheet of sheets) {
  const source = readFileSync(path.join(sourceDir, sheet), "utf8");
  const output = source
    .replaceAll('url("../fonts/', 'url("/assets/fonts/')
    .replaceAll('url("../img/', 'url("/assets/img/');
  const target = path.join(targetDir, sheet);
  const previous = (() => {
    try {
      return readFileSync(target, "utf8");
    } catch {
      return null;
    }
  })();
  if (previous !== output) rewritten.push(sheet);
  writeFileSync(target, output);
}

const summary = rewritten.length ? `updated ${rewritten.join(", ")}` : "already in sync";
console.log(`styles: ${summary}`);

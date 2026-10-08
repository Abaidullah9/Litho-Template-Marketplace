#!/usr/bin/env node
/**
 * Compares a React-exported page against the hand-written page it replaces.
 *
 * The check is run on the main content region so navigation chrome that is intentionally rebuilt
 * (absolute links, retargeted assets) does not drown out real differences. Two signals are
 * compared: the sequence of tags, and the collapsed text content.
 *
 *   node scripts/check-parity.mjs <legacy.html> <exported.html> [--marker id]
 *   node scripts/check-parity.mjs --all            # every pair in scripts/parity-pages.json
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Each marker is [a search string the region starts at, the tag it ends after]. */
const markers = {
  content: ['id="main-content"', "</main>"],
  // Admin-shell pages (the submission form, the dashboard screens) name their main region
  // `admin-content` instead.
  adminContent: ['id="admin-content"', "</main>"],
  // The marketplace home has a plain <main>; its catalog is rendered by the shared engine.
  homeMain: ["<main>", "</main>"],
  exploreMain: ['id="explorer"', "</main>"],
  detailMain: ['id="plugin-detail"', "</main>"],
  // The sign-in card is the one admin page with server-rendered markup of its own.
  loginMain: ['class="login-shell"', "</main>"],
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

/** Migrated pages, so `--all` covers the whole cut-over set in one run. */
function manifestPairs() {
  const manifest = JSON.parse(readFileSync(path.join(scriptDir, "parity-pages.json"), "utf8"));
  return manifest.map((entry) => ({
    legacy: path.resolve(scriptDir, entry.legacy),
    exported: path.resolve(scriptDir, entry.exported),
    marker: entry.marker || "content",
  }));
}

function parseArgs(argv) {
  if (argv.includes("--all")) return manifestPairs();
  const [legacy, exported] = argv.filter((arg) => !arg.startsWith("--"));
  const markerIndex = argv.indexOf("--marker");
  const marker = markerIndex >= 0 ? argv[markerIndex + 1] : "content";
  if (!legacy || !exported) {
    console.error("usage: check-parity.mjs <legacy.html> <exported.html> [--marker content] | --all");
    process.exit(2);
  }
  if (!markers[marker]) {
    console.error(`unknown marker '${marker}' (known: ${Object.keys(markers).join(", ")})`);
    process.exit(2);
  }
  return [{ legacy, exported, marker }];
}

/** Slice out the region that both pages are expected to share verbatim. */
function region(html, marker) {
  const [startAt, endTag] = markers[marker];
  const start = html.indexOf(startAt);
  if (start < 0) return null;
  const end = html.indexOf(endTag, start);
  if (end < 0) return null;
  return html.slice(start, end + endTag.length);
}

const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/**
 * SVG shapes are the one place the two serializers disagree without disagreeing about the DOM: the
 * hand-written HTML self-closes them (`<circle …/>`) and React writes an explicit closer, which is
 * what SVG-in-HTML permits either way. A closer that immediately follows its own open tag therefore
 * describes an empty element on both sides and is dropped.
 */
const svgEmpty = new Set([
  "circle", "ellipse", "image", "line", "path", "polygon", "polyline", "rect", "stop", "use",
  "feblend", "fecolormatrix", "fecomponenttransfer", "fecomposite", "feconvolvematrix",
  "fediffuselighting", "fedisplacementmap", "fedistantlight", "fedropshadow", "feflood",
  "fefunca", "fefuncb", "fefuncg", "fefuncr", "fegaussianblur", "feimage", "femerge",
  "femergenode", "femorphology", "feoffset", "fepointlight", "fespecularlighting",
  "fespotlight", "fetile", "feturbulence",
]);

function tags(html) {
  const found = [];
  for (const match of html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/g)) {
    const name = match[1].toLowerCase();
    if (name === "script" || name === "style") continue;
    found.push(`${match[0][1] === "/" ? "/" : ""}${name}`);
  }
  return found
    .filter((tag) => !voidTags.has(tag.slice(1)) || tag.startsWith("/"))
    .filter((tag, index, all) => !(tag.startsWith("/") && svgEmpty.has(tag.slice(1)) && all[index - 1] === tag.slice(1)));
}

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&nbsp;", "\u00a0")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function text(html) {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, " ");
  const withoutScripts = withoutComments.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ");
  const stripped = withoutScripts.replace(/<[^>]+>/g, " ");
  // Newlines are part of the code samples, so they collapse to a space like every other run.
  return decodeEntities(stripped).replace(/\s+/g, " ").trim();
}

function firstDifference(a, b) {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    if (a[index] !== b[index]) {
      return { index, context: 120 };
    }
  }
  return null;
}

function checkPair({ legacy, exported, marker }) {
  const legacyRegion = region(readFileSync(legacy, "utf8"), marker);
  const exportedRegion = region(readFileSync(exported, "utf8"), marker);

  if (!legacyRegion) {
    console.error(`could not find the '${marker}' region in ${legacy}`);
    return 2;
  }
  if (!exportedRegion) {
    console.error(`could not find the '${marker}' region in ${exported}`);
    return 2;
  }

  const problems = [];

  const legacyTags = tags(legacyRegion);
  const exportedTags = tags(exportedRegion);
  if (legacyTags.join(" ") !== exportedTags.join(" ")) {
    let at = 0;
    while (at < legacyTags.length && at < exportedTags.length && legacyTags[at] === exportedTags[at]) at += 1;
    problems.push(
      [
        `tag sequence differs at token ${at}`,
        `  legacy  : …${legacyTags.slice(Math.max(0, at - 20), at + 20).join(" ")}`,
        `  exported: …${exportedTags.slice(Math.max(0, at - 20), at + 20).join(" ")}`,
      ].join("\n"),
    );
  }

  const legacyText = text(legacyRegion);
  const exportedText = text(exportedRegion);
  if (legacyText !== exportedText) {
    const diff = firstDifference(legacyText, exportedText);
    const at = diff ? diff.index : Math.min(legacyText.length, exportedText.length);
    problems.push(
      [
        `text content differs at character ${at}`,
        `  legacy  : …${legacyText.slice(Math.max(0, at - 90), at + 90)}…`,
        `  exported: …${exportedText.slice(Math.max(0, at - 90), at + 90)}…`,
      ].join("\n"),
    );
  }

  const name = path.relative(process.cwd(), exported);
  console.log(`${name} [${marker}] tags ${legacyTags.length}/${exportedTags.length}, text ${legacyText.length}/${exportedText.length}`);

  if (problems.length) {
    console.error(`\n${problems.join("\n\n")}`);
    return 1;
  }
  console.log("  parity: identical");
  return 0;
}

const statuses = parseArgs(process.argv.slice(2)).map(checkPair);
const failed = statuses.filter((status) => status !== 0);
if (failed.length) process.exit(Math.max(...failed));
console.log(`\n${statuses.length} page(s) at parity.`);

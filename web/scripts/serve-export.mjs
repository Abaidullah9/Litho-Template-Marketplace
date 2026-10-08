#!/usr/bin/env node
/**
 * Serves `out/` for local review, falling back to `../site/` for the assets, data files and uploads
 * that the export deliberately shares with the deployed site. The real deployment copies the export
 * into `site/`, where every path resolves without a fallback.
 *
 * Requests the deployed site would answer from Express rather than from a file — the API and the
 * uploaded media — are proxied to the legacy server so the preview behaves like the real thing.
 *
 *   node scripts/serve-export.mjs [port]
 */
import { createServer, request as httpRequest } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportRoot = path.join(webRoot, "out");
const fallbackRoot = path.resolve(webRoot, "..", "site");
const port = Number(process.argv[2]) > 0 ? Number(process.argv[2]) : 3010;
const apiOrigin = process.env.LEGACY_SITE_ORIGIN || "http://127.0.0.1:8787";

/** Paths the deployed Express server owns; everything else is a static file. */
const proxied = [/^\/api(\/|$)/, /^\/uploads(\/|$)/];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

/** Resolve a URL path inside a root without escaping it. */
function resolveWithin(root, pathname) {
  const decoded = decodeURIComponent(pathname);
  const target = path.join(root, decoded);
  const normalized = path.normalize(target);
  return normalized.startsWith(path.normalize(root)) ? normalized : null;
}

/**
 * The deployed site resolves `/` to index.html and extensionless paths to their `.html` file, so
 * the preview server does the same before falling back to the shared asset tree.
 */
function candidates(pathname) {
  const tries = [pathname];
  if (pathname.endsWith("/")) tries.push(`${pathname}index.html`);
  else if (!path.posix.extname(pathname)) tries.push(`${pathname}.html`, `${pathname}/index.html`);
  return tries;
}

function findFile(pathname) {
  for (const root of [exportRoot, fallbackRoot]) {
    for (const attempt of candidates(pathname)) {
      const candidate = resolveWithin(root, attempt);
      if (!candidate) continue;
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

function proxy(request, response, pathname) {
  const target = new URL(pathname + new URL(request.url || "/", "http://127.0.0.1").search, apiOrigin);
  const upstream = httpRequest(
    target,
    { method: request.method, headers: { ...request.headers, host: target.host } },
    (answer) => {
      response.writeHead(answer.statusCode || 502, answer.headers);
      answer.pipe(response);
    },
  );
  upstream.on("error", () => {
    response.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: { message: `Cannot reach ${apiOrigin}.`, code: "proxy" } }));
  });
  request.pipe(upstream);
}

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  if (proxied.some((pattern) => pattern.test(url.pathname))) {
    proxy(request, response, url.pathname);
    return;
  }
  const file = findFile(url.pathname);
  if (!file) {
    const notFound = resolveWithin(exportRoot, "/404.html");
    response.writeHead(404, { "content-type": contentTypes[".html"] });
    if (notFound && existsSync(notFound)) {
      createReadStream(notFound).pipe(response);
      return;
    }
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`export preview on http://127.0.0.1:${port}/ (out/ with ../site/ fallback)`);
});

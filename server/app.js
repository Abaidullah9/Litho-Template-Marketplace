import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { notFound, toErrorResponse } from "./errors.js";
import { createPublicRouter } from "./routes/public.js";
import { createAdminRouter } from "./routes/admin.js";

/** Extension-less page routes: /submit, /admin/templates, /template … */
const PAGE_ROUTES = {
  "/": "index.html",
  "/submit": "submit.html",
  "/publish": "publish.html",
  "/develop": "develop.html",
  "/explore": "explore.html",
  "/template": "template.html",
  "/plugins": "index.html",
  "/plugin": "template.html",
  "/admin": "admin/index.html",
  "/admin/dashboard": "admin/index.html",
  "/admin/login": "admin/login.html",
  "/admin/templates": "admin/templates.html",
  "/admin/templates/new": "admin/templates/new.html",
  "/admin/submissions": "admin/submissions.html",
  "/admin/categories": "admin/categories.html",
  "/admin/tags": "admin/tags.html",
  "/admin/publishers": "admin/publishers.html",
  "/admin/analytics": "admin/analytics.html",
  "/admin/registry": "admin/registry.html",
  "/admin/settings": "admin/settings.html",
  "/admin/activity": "admin/activity.html",
  "/admin/admins": "admin/admins.html",
};

/**
 * Application factory.
 *
 * `supabase` is passed as a getter so tests can inject a fake client and so
 * the server can start (and serve the marketplace) before credentials exist.
 */
export function createApp({ config, supabase = () => null }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", false);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  // Basic security headers — this app serves HTML, JSON and uploaded files.
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });

  app.use("/uploads", express.static(config.uploadsRoot, {
    dotfiles: "deny",
    fallthrough: true,
    maxAge: "7d",
  }));

  app.use("/api", createPublicRouter({ config, supabase }));
  app.use("/api/admin", createAdminRouter({ config, supabase }));

  const basePath = "/Litho-Template-Marketplace";
  const pages = express.Router();
  for (const [route, file] of Object.entries(PAGE_ROUTES)) {
    const target = path.join(config.siteRoot, file);
    if (!existsSync(target)) continue;
    pages.get(route, (req, res) => res.sendFile(target, { dotfiles: "allow" }));
    pages.get(`${route}/`, (req, res) => res.sendFile(target, { dotfiles: "allow" }));
    pages.get(`${basePath}${route}`, (req, res) => res.sendFile(target, { dotfiles: "allow" }));
    pages.get(`${basePath}${route}/`, (req, res) => res.sendFile(target, { dotfiles: "allow" }));
  }
  app.use(pages);

  app.use(basePath, express.static(config.siteRoot, { dotfiles: "allow", extensions: ["html"], index: "index.html" }));
  app.use(express.static(config.siteRoot, { dotfiles: "allow", extensions: ["html"], index: "index.html" }));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next(notFound("Endpoint not found."));
      return;
    }
    next(notFound("Page not found."));
  });

  app.use((error, req, res, next) => {
    const { status, body } = toErrorResponse(error);
    if (status >= 500) console.error("[api]", error);
    if (res.headersSent) return next(error);
    res.status(status).json(body);
  });

  return app;
}

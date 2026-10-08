import { Router } from "express";
import { asyncRoute, unconfigured } from "../errors.js";
import { handleUploadError, upload } from "../uploads.js";
import { createPublicController } from "../controllers/public-controller.js";

/**
 * Public API route table.
 *
 * Wiring only: middleware order and paths live here, behaviour lives in
 * `controllers/public-controller.js`.
 */
export function createPublicRouter({ config, supabase }) {
  const router = Router();
  const controller = createPublicController({ config, supabase });

  const ensureSupabase = (req, res, next) => {
    if (!config.supabaseConfigured || !supabase()) {
      next(unconfigured("The marketplace API is not connected to Supabase yet."));
      return;
    }
    next();
  };

  const uploads = upload.fields([{ name: "previewImage", maxCount: 1 }, { name: "sampleFile", maxCount: 1 }]);

  router.get("/health", asyncRoute(controller.health));

  router.get("/templates", ensureSupabase, asyncRoute(controller.listTemplates));
  router.get("/templates/:slug", ensureSupabase, asyncRoute(controller.showTemplate));
  router.post("/templates/:identifier/view", ensureSupabase, asyncRoute(controller.recordView));
  router.post("/templates/:identifier/download", ensureSupabase, asyncRoute(controller.recordDownload));

  router.get("/categories", ensureSupabase, asyncRoute(controller.listCategories));
  router.get("/categories/:slug", ensureSupabase, asyncRoute(controller.showCategory));
  router.get("/tags", ensureSupabase, asyncRoute(controller.listTags));
  router.get("/publishers", ensureSupabase, asyncRoute(controller.listPublishers));

  router.post("/submissions", ensureSupabase, uploads, handleUploadError, asyncRoute(controller.createSubmission));

  router.get("/registry", asyncRoute(controller.getRegistry));

  return router;
}

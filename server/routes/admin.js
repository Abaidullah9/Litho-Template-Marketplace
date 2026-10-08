import { Router } from "express";
import { asyncRoute, unconfigured } from "../errors.js";
import { requireAdmin, verifyAdminOrigin } from "../auth.js";
import { handleUploadError, upload } from "../uploads.js";
import { createAdminController } from "../controllers/admin-controller.js";

/** Single-template state transitions exposed as POST /templates/:id/<action>. */
const TEMPLATE_ACTIONS = [
  "publish",
  "unpublish",
  "archive",
  "feature",
  "unfeature",
  "verify",
  "unverify",
];

/**
 * Admin API route table.
 *
 * Wiring only. `requireAdmin` runs before `ensureSupabase` so an unauthenticated
 * caller gets 401 rather than a misconfigured-database 503.
 */
export function createAdminRouter({ config, supabase }) {
  const router = Router();
  const controller = createAdminController({ config, supabase });

  const ensureSupabase = (req, res, next) => {
    if (!config.supabaseConfigured || !supabase()) {
      next(unconfigured("The admin API is not connected to Supabase yet."));
      return;
    }
    next();
  };

  const uploads = upload.fields([{ name: "previewImage", maxCount: 1 }, { name: "sampleFile", maxCount: 1 }]);

  router.use(verifyAdminOrigin);

  router.post("/login", asyncRoute(controller.login));
  router.post("/logout", asyncRoute(controller.logout));

  router.use(requireAdmin(config));
  router.use(ensureSupabase);

  router.get("/admins", asyncRoute(controller.listAdminUsers));
  router.post("/admins", asyncRoute(controller.createAdminUser));
  router.delete("/admins/:id", asyncRoute(controller.deleteAdminUser));

  router.get("/session", asyncRoute(controller.session));
  router.get("/dashboard", asyncRoute(controller.dashboard));

  router.get("/templates", asyncRoute(controller.listTemplates));
  router.post("/templates", uploads, handleUploadError, asyncRoute(controller.createTemplate));
  router.post("/templates/bulk", asyncRoute(controller.bulkTemplates));
  router.get("/templates/:id", asyncRoute(controller.getTemplate));
  router.put("/templates/:id", uploads, handleUploadError, asyncRoute(controller.updateTemplate));
  router.delete("/templates/:id", asyncRoute(controller.deleteTemplate));
  for (const action of TEMPLATE_ACTIONS) {
    router.post(`/templates/:id/${action}`, asyncRoute(controller.templateAction(action)));
  }

  router.get("/categories", asyncRoute(controller.listCategories));
  router.post("/categories", asyncRoute(controller.createCategory));
  router.put("/categories/:id", asyncRoute(controller.updateCategory));
  router.delete("/categories/:id", asyncRoute(controller.deleteCategory));

  router.get("/tags", asyncRoute(controller.listTags));
  router.post("/tags", asyncRoute(controller.createTag));
  router.put("/tags/:id", asyncRoute(controller.updateTag));
  router.delete("/tags/:id", asyncRoute(controller.deleteTag));

  router.get("/publishers", asyncRoute(controller.listPublishers));
  router.post("/publishers", asyncRoute(controller.createPublisher));
  router.put("/publishers/:id", asyncRoute(controller.updatePublisher));
  router.delete("/publishers/:id", asyncRoute(controller.deletePublisher));

  router.get("/submissions", asyncRoute(controller.listSubmissions));
  router.get("/submissions/:id", asyncRoute(controller.getSubmission));
  router.post("/submissions/:id/approve", asyncRoute(controller.approveSubmission));
  router.post("/submissions/:id/reject", asyncRoute(controller.rejectSubmission));

  router.post("/registry/generate", asyncRoute(controller.generateRegistryFile));

  router.get("/analytics", asyncRoute(controller.analytics));
  router.get("/settings", asyncRoute(controller.getSettings));
  router.put("/settings", asyncRoute(controller.putSettings));
  router.get("/activity", asyncRoute(controller.listActivity));

  return router;
}

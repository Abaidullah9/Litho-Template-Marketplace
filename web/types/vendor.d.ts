/**
 * Declarations for the modules copied out of `site/assets/js` by scripts/sync-engine.mjs.
 *
 * They are plain JavaScript and stay untyped on purpose: the pages that import them only need the
 * module to run, and `allowJs` stays off so the migration does not have to type a 4,000-line DOM
 * engine it deliberately did not rewrite.
 */
declare module "@/vendor/app.js";
declare module "@/vendor/develop.js";
declare module "@/vendor/publish.js";
declare module "@/vendor/explore.js";
declare module "@/vendor/plugin.js";
declare module "@/vendor/admin/login.js";
declare module "@/vendor/admin/dashboard.js";
declare module "@/vendor/admin/templates.js";
declare module "@/vendor/admin/template-form.js";
declare module "@/vendor/admin/submissions.js";
declare module "@/vendor/admin/taxonomy.js";
declare module "@/vendor/admin/analytics.js";
declare module "@/vendor/admin/registry.js";
declare module "@/vendor/admin/activity.js";
declare module "@/vendor/admin/settings.js";
declare module "@/vendor/admin/admins.js";

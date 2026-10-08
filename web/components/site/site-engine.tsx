"use client";

import { useEffect, useState } from "react";

/**
 * The vendored `site/assets/js` modules, one per page. They are imported statically so the bundler
 * can see every specifier; the import itself is deferred into the effect below.
 */
const engines = {
  home: () => import("@/vendor/app.js"),
  explore: () => import("@/vendor/explore.js"),
  template: () => import("@/vendor/plugin.js"),
  adminLogin: () => import("@/vendor/admin/login.js"),
  adminDashboard: () => import("@/vendor/admin/dashboard.js"),
  adminTemplates: () => import("@/vendor/admin/templates.js"),
  adminTemplateForm: () => import("@/vendor/admin/template-form.js"),
  adminSubmissions: () => import("@/vendor/admin/submissions.js"),
  adminCategories: () => import("@/vendor/admin/taxonomy.js"),
  adminTags: () => import("@/vendor/admin/taxonomy.js"),
  adminPublishers: () => import("@/vendor/admin/taxonomy.js"),
  adminAnalytics: () => import("@/vendor/admin/analytics.js"),
  adminRegistry: () => import("@/vendor/admin/registry.js"),
  adminActivity: () => import("@/vendor/admin/activity.js"),
  adminSettings: () => import("@/vendor/admin/settings.js"),
  adminAdmins: () => import("@/vendor/admin/admins.js"),
} as const;

export type EngineName = keyof typeof engines;

/**
 * Boots one of the vendored page modules after the React page has mounted.
 *
 * Every engine reads its containers at module scope and then runs, so it has to be imported
 * *after* the markup exists — hence the dynamic import inside the effect. Module caching means a
 * second effect run (React strict mode, a re-mount) re-uses the first evaluation, so an engine can
 * never bind its listeners twice.
 */
export function SiteEngine({ engine }: { engine: EngineName }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    engines[engine]().catch((error: unknown) => {
      if (cancelled) return;
      setFailed(true);
      console.error(`The ${engine} page module failed to start:`, error);
    });
    return () => {
      cancelled = true;
    };
  }, [engine]);

  if (!failed) return null;
  return (
    <p role="alert" style={{ margin: "18px 0", color: "var(--updated)" }}>
      This page could not start. Reload to try again.
    </p>
  );
}

import "@/styles/admin.css";
import { BodyClass } from "@/components/site/body-class";
import { SiteEngine, type EngineName } from "@/components/site/site-engine";

/** Every admin page is excluded from crawlers, exactly like the hand-written pages. */
export const adminRobots = { index: false, follow: false } as const;

/**
 * The dashboard screens carry no server-rendered markup at all: the hand-written pages were a
 * `<body class="admin-page">` plus one module, and `mountAdmin()` in that module builds the sidebar,
 * topbar and content host. The React page keeps the same contract so the server never has to render
 * a signed-in shell.
 */
export function AdminScreen({ engine }: { engine: EngineName }) {
  return (
    <>
      <BodyClass name="admin-page" />
      <SiteEngine engine={engine} />
    </>
  );
}

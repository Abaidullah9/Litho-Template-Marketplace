import type { Metadata } from "next";
import "@/styles/admin.css";
import { AdminToast } from "@/components/site/admin-toast";
import { BodyClass } from "@/components/site/body-class";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit a Template | Template Marketplace",
  description: "Submit a template to the marketplace. No account required.",
  openGraph: {
    title: "Submit a Template | Template Marketplace",
    description: "Submit a template to the marketplace. No account required.",
  },
};

/**
 * Port of site/submit.html: the public submission form, which borrows the admin shell but keeps
 * its own marketplace navigation and needs no session.
 */
export default function SubmitPage() {
  return (
    <>
      <BodyClass name="admin-page" />
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <a className="admin-brand" href="/index.html">
            <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width={656} height={192} />
            <span>Submit</span>
          </a>
          <nav className="admin-nav" aria-label="Marketplace navigation">
            <div className="nav-group">Marketplace</div>
            <a href="/index.html">Browse templates</a>
            <a href="/publish.html">Submission guide</a>
            <a href="/develop.html">Guidelines</a>
            <div className="nav-group">Account</div>
            <a href="/index.html#catalog">Registry</a>
          </nav>
          <div className="admin-sidebar-foot">
            <a className="btn ghost small" href="/index.html">
              ← Back to the marketplace
            </a>
          </div>
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div>
                <div className="crumbs">Marketplace / Contribution</div>
                <h1>Submit a template</h1>
              </div>
            </div>
            <div className="admin-actions">
              <a className="btn ghost" href="/publish.html">
                Read the guide →
              </a>
            </div>
          </header>
          <main className="admin-body" id="admin-content">
            <div className="notice">
              <strong>No account required.</strong> Submissions enter the review queue as <em>pending</em>. An
              administrator reviews every entry before it appears in the marketplace, and can reject it with a reason.
            </div>

            <section className="panel">
              <div className="panel-head">
                <h2>Template submission</h2>
                <span className="field-hint">* required</span>
              </div>
              <div className="panel-body">
                <SubmitForm />
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>What happens next</h2>
              </div>
              <div className="panel-body">
                <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 2, fontSize: 13, color: "var(--muted)" }}>
                  <li>
                    Your entry is stored as <strong style={{ color: "var(--text)" }}>pending</strong> — nothing is public
                    yet.
                  </li>
                  <li>An administrator reviews the metadata, links and preview.</li>
                  <li>Approved entries are published, verified manually, and appear after the next registry generation.</li>
                  <li>Rejected entries get a reason you can act on.</li>
                </ol>
              </div>
            </section>
          </main>
        </div>
      </div>
      <AdminToast />
    </>
  );
}

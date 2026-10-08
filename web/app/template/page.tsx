import type { Metadata } from "next";
import { SiteEngine } from "@/components/site/site-engine";

export const metadata: Metadata = {
  title: "Template Details | Template Marketplace",
  description: "Template details, preview, downloads and verification status.",
  openGraph: {
    title: "Template Details | Template Marketplace",
    description: "Template details, preview, downloads and verification status.",
    images: [
      {
        url: "https://litho-templates.github.io/litho-template-marketplace/assets/img/litho-template-marketplace-preview.png",
        width: 1179,
        height: 961,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Template Details | Template Marketplace",
    description: "Template details, preview, downloads and verification status.",
    images: ["https://litho-templates.github.io/litho-template-marketplace/assets/img/litho-template-marketplace-preview.png"],
  },
};

/**
 * Port of site/template.html: the detail shell. The catalog data, the renders and the lightbox all
 * come from the vendored `plugin.js` engine, which fills these containers on mount.
 */
export default function TemplatePage() {
  return (
    <>
      <a className="skip-link" href="#plugin-detail">
        Skip to template details
      </a>
      <div className="app-shell">
        <aside className="left-sidebar">
          <div className="sidebar-brand">
            <a href="/index.html" aria-label="Template Marketplace home">
              <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width={656} height={192} />
              <span>TEMPLATE MARKETPLACE</span>
            </a>
          </div>
          <div className="sidebar-section">
            <span className="label">Marketplace</span>
            <div className="workspace-select">
              <span className="workspace-dot" aria-hidden="true" />
              Document templates
            </div>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">Discover</div>
            <a className="sidebar-link" href="/index.html">
              Browse templates
            </a>
            <a className="sidebar-link" href="/explore.html">
              Explore
            </a>
            <a className="sidebar-link" href="/develop.html">
              Guidelines
            </a>
            <a className="sidebar-link" href="/submit.html">
              Submit a template
            </a>
          </div>
          <div className="sidebar-bottom">
            <a className="sidebar-link" href="https://github.com/litho-templates/litho-template-marketplace">
              GitHub repository ↗
            </a>
          </div>
        </aside>
        <div className="center-panel">
          <header className="doc-topbar">
            <div className="crumbs">
              <span>Marketplace / Templates / </span>
              <b id="crumb-name">Loading…</b>
            </div>
            <div className="top-actions">
              <a className="square-action desktop-only" href="/index.html">
                Browse
              </a>
              <button className="square-action theme-toggle" type="button" aria-label="Choose color theme">
                <svg className="palette-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .9-1.8 2-1.8H17a4 4 0 0 0 4-4c0-4.4-4-7.7-9-7.7Z" />
                  <circle cx="7.5" cy="11" r="1.3" />
                  <circle cx="10.5" cy="7" r="1.3" />
                  <circle cx="15" cy="7.5" r="1.3" />
                </svg>
                <span className="theme-toggle-label">Theme</span>
              </button>
            </div>
          </header>
          <main id="plugin-detail" className="page-content" tabIndex={-1}>
            <div id="detail-content">
              <div className="skeleton wide" />
              <div className="skeleton" />
              <div className="skeleton short" />
            </div>
            <div id="detail-error" className="empty-state" hidden>
              <h1>Template not found</h1>
              <p>This template does not exist in the current catalog.</p>
              <a className="button" href="/index.html">
                Back to marketplace
              </a>
            </div>
          </main>
        </div>
        <aside className="right-aside">
          <div className="aside-block">
            <span className="aside-title">On this page</span>
            <a className="aside-link active" href="#overview">
              Overview
            </a>
            <a className="aside-link" href="#download">
              Download
            </a>
            <a className="aside-link" href="#details">
              Details
            </a>
            <a className="aside-link" id="aside-verification-link" href="#verification">
              Verification status
            </a>
            <a className="aside-link" id="aside-security-link" href="#security" hidden>
              Security Notice
            </a>
            <a className="aside-link" href="#terms">
              Terms of Use
            </a>
          </div>
          <div className="aside-block">
            <span className="aside-title">Metadata</span>
            <dl className="aside-meta">
              <div>
                <dt>Availability</dt>
                <dd id="aside-status">—</dd>
              </div>
              <div id="aside-verification-row">
                <dt>Verification</dt>
                <dd id="aside-verification">—</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd id="aside-version">—</dd>
              </div>
              <div>
                <dt>Licence</dt>
                <dd id="aside-license">—</dd>
              </div>
              <div>
                <dt>Publisher</dt>
                <dd id="aside-owner">—</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
      <dialog className="preview-lightbox" id="preview-lightbox" aria-label="Template preview" />
      <nav className="mobile-bottom" aria-label="Mobile navigation">
        <a href="/index.html">Browse</a>
        <a className="active" href="#overview">
          Template
        </a>
        <a href="#download">Download</a>
        <a href="/submit.html">Submit</a>
      </nav>
      <div className="toast" id="toast" role="status" aria-live="polite">
        Download started
      </div>
      <SiteEngine engine="template" />
    </>
  );
}

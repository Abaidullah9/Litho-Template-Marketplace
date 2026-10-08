import type { Metadata } from "next";
import { BodyClass } from "@/components/site/body-class";
import { SiteEngine } from "@/components/site/site-engine";

export const metadata: Metadata = {
  title: "Browse Templates | Template Marketplace",
  description: "Discover academic and technical document templates: theses, papers, reports, CVs and more.",
  openGraph: {
    type: "website",
    title: "Template Marketplace",
    description: "Discover academic and technical document templates.",
    images: [{ url: "https://templates.litho.app/assets/img/litho-template-marketplace-preview.png", width: 1179, height: 961 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Template Marketplace",
    description: "Discover academic and technical document templates.",
    images: ["https://templates.litho.app/assets/img/litho-template-marketplace-preview.png"],
  },
};

const GAP = "\u00a0";

/**
 * Port of site/index.html.
 *
 * The catalog — search tokens, filters, pagination, the split view, the featured carousel and the
 * activity feed — is driven by the vendored `app.js` engine, which reads these containers and owns
 * them once mounted. The markup below is therefore the hand-written markup verbatim: the engine,
 * not React, renders everything inside the empty containers.
 */
export default function HomePage() {
  return (
    <>
      <BodyClass name="marketplace-page" />
      <a className="skip-link" href="#catalog">
        Skip to template catalog
      </a>

      <header className="market-header">
        <div className="market-header-inner">
          <div className="market-brand">
            <a className="market-brand-home" href="/index.html" aria-label="Template Marketplace home">
              <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width={656} height={192} />
              <span>TEMPLATE MARKETPLACE</span>
            </a>
          </div>
          <nav className="market-nav" aria-label="Main navigation">
            <a
              className="market-support-link"
              href="https://ko-fi.com/hancore"
              target="_blank"
              rel="noreferrer"
              aria-label="Support HANCORE on Ko-fi"
            >
              <span className="market-support-dot" aria-hidden="true" />
              Support ↗
            </a>
            <a className="active" href="#catalog" aria-label="Browse templates" aria-current="page">
              Browse<span className="market-nav-detail">{GAP}templates</span>
            </a>
            <a href="/explore.html">Explore</a>
            <a href="/develop.html" aria-label="Template guidelines">
              Guidelines
            </a>
            <a
              href="https://github.com/litho-templates/litho-template-marketplace"
              target="_blank"
              rel="noreferrer"
              aria-label="Contribute on GitHub"
            >
              Contribute<span className="market-nav-detail">{GAP}a template</span>
            </a>
            <a href="/submit.html" aria-label="Submit a template">
              Submit<span className="market-nav-detail">{GAP}a template</span>
              <span aria-hidden="true">{GAP}→</span>
            </a>
            <a
              className="market-admin-entry"
              href="/admin/login"
              aria-label="Sign in to the admin dashboard"
              title="Sign in to the admin dashboard"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4.5" y="10" width="15" height="9.5" rx="1.5" />
                <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
              </svg>
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
          </nav>
        </div>
      </header>

      <main>
        <section className="market-hero">
          <div className="market-hero-copy">
            <div className="page-eyebrow">Curated registry</div>
            <h1>discover document templates</h1>
            <p>
              Browse academic and technical templates for theses, papers, reports and CVs. Inspect the preview, download
              the source, and start writing.
            </p>
            <div className="market-hero-actions">
              <a className="button market-primary" href="#catalog">
                Browse templates <span aria-hidden="true">→</span>
              </a>
              <a className="button" href="/develop.html">
                Read the guidelines <span aria-hidden="true">→</span>
              </a>
              <a className="button publish-primary" href="/submit.html">
                Submit a template <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <button className="market-hero-ray" type="button" aria-label="Show next parametric animation. Current: Ray">
            <canvas width={400} height={300} aria-hidden="true" />
            <span className="market-hero-ray-label" aria-live="polite">
              RAY 04/06
            </span>
          </button>
        </section>

        <section className="gems-section" id="gems-section" aria-labelledby="gems-title" hidden>
          <div className="market-section-head">
            <h2 id="gems-title">FEATURED TEMPLATES</h2>
            <div className="recent-head-meta">
              <span id="gems-note" className="recent-summary">
                verified · highlighted by the editors
              </span>
              <a href="#catalog">sort by featured →</a>
              <div className="gems-nav" role="group" aria-label="Browse featured templates" hidden>
                <button
                  type="button"
                  className="recent-feed-toggle gems-nav-button"
                  data-gems-step="-1"
                  aria-controls="gems-grid"
                  aria-label="Previous featured templates"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="recent-feed-toggle gems-nav-button"
                  data-gems-step="1"
                  aria-controls="gems-grid"
                  aria-label="Next featured templates"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          <div id="gems-grid" className="recent-grid gems-track" aria-label="Featured templates" />
        </section>

        <section className="recent-section" id="recent-section" aria-labelledby="recent-title">
          <div className="market-section-head">
            <h2 id="recent-title">JUST LANDED</h2>
            <div className="recent-head-meta">
              <span id="recent-summary" className="recent-summary" />
              <a href="#catalog">view all →</a>
              <button
                id="recent-feed-toggle"
                className="recent-feed-toggle"
                type="button"
                aria-controls="recent-latest"
                aria-label="Pause the Just landed feed"
                hidden
              >
                Pause
              </button>
            </div>
          </div>
          <div id="recent-latest" className="landed-rows" hidden>
            <div className="landed-row">
              <ul className="landed-track" data-landed-row aria-label="Newest templates, first row" />
            </div>
            <div className="landed-row">
              <ul className="landed-track" data-landed-row aria-label="Newest templates, second row" />
            </div>
          </div>
        </section>

        <section className="market-catalog" id="catalog" aria-labelledby="catalog-title" tabIndex={-1}>
          <div className="catalog-heading">
            <div>
              <span className="page-eyebrow">Registry</span>
              <h2 id="catalog-title">browse all templates</h2>
            </div>
            <div className="catalog-heading-side">
              <div id="catalog-view-mode" className="catalog-view-mode" role="group" aria-label="Catalog layout">
                <button type="button" data-view="cards" aria-pressed="true">
                  Cards
                </button>
                <button type="button" data-view="split" aria-pressed="false">
                  Split view
                </button>
              </div>
              <p>
                <span id="plugin-count">0</span> <span id="plugin-count-label">community templates</span>
              </p>
            </div>
          </div>

          <div className="catalog-controls">
            <div className="market-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <button id="search-clear" className="search-clear" type="button" aria-label="Clear all search terms" hidden>
                <span aria-hidden="true">×</span>
              </button>
              <div className="search-token-editor">
                <div id="search-terms" className="search-terms" aria-label="Active search terms" />
                <div className="search-input-wrap">
                  <label className="sr-only" htmlFor="search-input">
                    Search templates, tags, text, or publishers
                  </label>
                  <input
                    id="search-input"
                    name="template-search"
                    type="search"
                    role="combobox"
                    placeholder="Search templates, tag:latex, kind:thesis, or @publisher…"
                    maxLength={160}
                    autoComplete="off"
                    spellCheck={false}
                    aria-autocomplete="both"
                    aria-controls="search-suggestions"
                    aria-expanded="false"
                  />
                  <span id="search-fish-preview" className="search-fish-preview" aria-hidden="true" hidden>
                    <span />
                    <b />
                  </span>
                </div>
              </div>
              <kbd id="search-shortcut">Ctrl K</kbd>
              <div id="search-suggestions" className="search-suggestions" role="listbox" aria-label="Search suggestions" hidden />
              <span id="search-suggestion-status" className="sr-only" aria-live="polite" />
            </div>
            <label className="sort-control">
              <span className="sr-only">Sort or filter templates</span>
              <select id="sort-select">
                <option value="added">Recently added</option>
                <option value="updated">Recent activity</option>
                <option value="views">Most viewed</option>
                <option value="downloads">Most downloaded</option>
                <option value="featured">Featured</option>
                <option value="name">A–Z</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4 4 4-4" />
              </svg>
            </label>
          </div>

          <div className="source-bar" hidden>
            <span>Source</span>
            <div id="source-filters" className="source-list" />
          </div>

          <div className="category-bar">
            <span>Filter</span>
            <div id="category-filters" className="category-list" />
            <button id="clear-filters" type="button">
              Reset
            </button>
          </div>

          <div id="plugin-grid" className="plugin-grid market-plugin-grid" />
          <div id="catalog-split" className="catalog-split" hidden>
            <section className="split-panel" aria-label="Template tiles">
              <div className="split-panel-label">
                <span>Templates</span>
                <button id="split-top-rank" className="split-top-rank" type="button" aria-pressed="false" hidden>
                  Top rank
                </button>
                <span id="split-panel-count" />
              </div>
              <div id="split-filters" className="split-filters" />
              <div
                id="split-grid"
                className="split-grid"
                role="listbox"
                aria-label="Select a template. Arrow keys move the selection, Page Up and Page Down change the page, Control Enter opens the template page in a background tab"
              />
              <div className="split-pager">
                <span className="split-pager-start">
                  <button id="split-page-previous" type="button">
                    ← Previous
                  </button>
                  <span className="split-hint" aria-hidden="true">
                    Ctrl+Enter or
                    <br />
                    Ctrl+click: new tab
                  </span>
                </span>
                <b id="split-page-summary">
                  <label className="split-page-jump">
                    Page <input id="split-page-input" type="number" inputMode="numeric" min={1} defaultValue={1} aria-label="Go to page" />
                  </label>{" "}
                  <span id="split-page-total" />
                </b>
                <button id="split-page-next" type="button">
                  Next →
                </button>
              </div>
            </section>
            <aside className="split-aside">
              <div id="split-card" className="plugin-grid market-plugin-grid split-card" />
              <section className="split-stats" aria-labelledby="split-stats-title">
                <div className="split-panel-label">
                  <span id="split-stats-title">Standing</span>
                  <span id="split-stats-total" />
                </div>
                <div id="split-stats-body" className="split-stats-body" />
                <p className="split-stats-foot">Standing among all marketplace templates</p>
              </section>
            </aside>
          </div>
          <div id="empty-state" className="empty-state" hidden>
            <h3>No templates found</h3>
            <p>Try another search or clear the active filters.</p>
            <button className="button" id="empty-reset" type="button">
              Clear filters
            </button>
          </div>
          <nav id="catalog-pagination" className="catalog-pagination" aria-label="Template result pages">
            <button id="page-previous" className="pagination-button pagination-previous" type="button">
              <span className="pagination-direction">
                <span aria-hidden="true">←</span> Previous
              </span>
              <span id="page-previous-label" className="pagination-target">
                First page
              </span>
            </button>
            <span className="pagination-summary" aria-hidden="true">
              <span>Page</span>
              <strong id="page-summary">1 / 1</strong>
            </span>
            <button id="page-next" className="pagination-button pagination-next" type="button">
              <span className="pagination-direction">
                Next <span aria-hidden="true">→</span>
              </span>
              <span id="page-next-label" className="pagination-target">
                Last page
              </span>
            </button>
          </nav>
          <div id="catalog-view-toggle" className="catalog-view-toggle" hidden>
            <button
              id="catalog-view-button"
              className="catalog-view-button"
              type="button"
              aria-controls="plugin-grid"
              aria-expanded="false"
            >
              <span id="catalog-view-label">Browse all templates</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
          <span id="catalog-result-status" className="sr-only" role="status" aria-live="polite" />
        </section>
      </main>

      <div id="catalog-view-dock" className="catalog-view-dock" hidden>
        <button id="catalog-view-dock-button" type="button">
          <span id="catalog-view-dock-status">Showing all templates</span>
          <span className="catalog-view-dock-action">
            Show 9 per page <span aria-hidden="true">↑</span>
          </span>
        </button>
      </div>

      <footer className="market-footer" id="site-footer">
        <div className="footer-status">
          <a
            className="footer-status-link footer-maintainer"
            href="https://github.com/HANCORE-linux"
            target="_blank"
            rel="noreferrer"
          >
            HANCORE <span aria-hidden="true">↗</span>
          </a>
          <div className="footer-status-copy">
            <a className="footer-wordmark-link" href="/index.html" aria-label="Template Marketplace home">
              <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width={656} height={192} />
            </a>
          </div>
          <div className="footer-resource-links">
            <a className="footer-status-link" href="/admin/login">
              ADMIN <span aria-hidden="true">↗</span>
            </a>
            <a
              className="footer-status-link"
              href="https://github.com/litho-templates/litho-template-marketplace/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
            >
              MIT LICENSE <span aria-hidden="true">↗</span>
            </a>
            <a
              className="footer-status-link"
              href="https://github.com/litho-templates/litho-template-marketplace"
              target="_blank"
              rel="noreferrer"
            >
              GITHUB <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </footer>

      <nav className="mobile-bottom" aria-label="Mobile navigation">
        <a className="active" href="/index.html" aria-current="page">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 11.5 12 5l8 6.5V20H4v-8.5Z" />
          </svg>
          Home
        </a>
        <a href="#catalog">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          Browse
        </a>
        <a href="/explore.html">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="7" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="12" cy="18" r="2" />
            <path d="m8 7 8-1M7 9l4 7m6-8-4 8" />
          </svg>
          Explore
        </a>
        <a href="/submit.html">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v16M4 12h16" />
          </svg>
          Submit
        </a>
      </nav>
      <div className="toast" id="toast" role="status" aria-live="polite">
        Command copied
      </div>
      <SiteEngine engine="home" />
    </>
  );
}

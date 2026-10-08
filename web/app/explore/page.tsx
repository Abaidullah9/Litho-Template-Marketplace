import type { Metadata } from "next";
import "@/styles/explore.css";
import { BodyClass } from "@/components/site/body-class";
import { SiteEngine } from "@/components/site/site-engine";

export const metadata: Metadata = {
  title: "Explore Templates | Template Marketplace",
  description: "Explore semantic communities and growth across the template marketplace.",
};

const GAP = "\u00a0";

/**
 * Port of site/explore.html.
 *
 * The semantic graph, its communities, the detail drawer and the growth chart all belong to the
 * vendored `explore.js` engine, which reads these containers on mount — so the markup here is the
 * hand-written markup verbatim and React never renders inside them.
 */
export default function ExplorePage() {
  return (
    <>
      <BodyClass name="marketplace-page explore-page" />
      <a className="skip-link" href="#explorer">
        Skip to template explorer
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
            <a href="/index.html#catalog" aria-label="Browse templates">
              Browse<span className="market-nav-detail">{GAP}templates</span>
            </a>
            <a className="active" href="/explore.html" aria-current="page">
              Explore
            </a>
            <a href="/develop.html" aria-label="Template guidelines">
              Guidelines<span className="market-nav-detail">{GAP}</span>
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

      <main id="explorer" className="explore-main">
        <header className="explore-heading">
          <div>
            <span className="page-eyebrow">Community registry</span>
            <h1>explore community templates</h1>
            <p>Discover related templates through semantic communities or inspect registry growth over time.</p>
          </div>
          <div className="explore-heading-side">
            <div className="explore-tabs" role="tablist" aria-label="Explorer view">
              <button
                id="graph-tab"
                className="active"
                type="button"
                role="tab"
                aria-selected="true"
                aria-controls="graph-view"
                data-explore-view="graph"
              >
                Graph view
              </button>
              <button
                id="growth-tab"
                type="button"
                role="tab"
                aria-selected="false"
                aria-controls="growth-view"
                data-explore-view="growth"
                tabIndex={-1}
              >
                Growth
              </button>
            </div>
            <div className="explore-freshness" aria-label="Explorer data freshness">
              <span>
                Data updated ·{" "}
                <time id="explorer-updated" dateTime="">
                  Pending
                </time>
              </span>
              <span>
                Daily refresh start · <strong id="explorer-refresh-time">04:17 UTC</strong>
              </span>
            </div>
          </div>
        </header>

        <section id="graph-view" className="explore-view graph-view" role="tabpanel" aria-labelledby="graph-tab">
          <div className="explore-toolbar">
            <label className="explore-search">
              <span className="sr-only">Search template graph</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                id="graph-search"
                type="search"
                name="graph-search"
                placeholder="Search templates, tags, or @authors…"
                autoComplete="off"
                spellCheck={false}
              />
              <output id="graph-match-count" className="graph-match-count" htmlFor="graph-search" aria-live="polite" hidden />
            </label>
            <button id="graph-density" className="explore-primary" type="button" aria-pressed="false">
              Show all →
            </button>
            <button id="graph-reset" type="button">
              Reset
            </button>
          </div>
          <div className="graph-workspace">
            <canvas
              id="plugin-graph"
              tabIndex={0}
              aria-label="Interactive semantic graph of community templates"
              aria-describedby="graph-instructions"
            />
            <p id="graph-instructions" className="graph-instructions">
              Drag to pan · scroll to zoom · click a template for details · arrow keys move through templates
            </p>
            <div id="graph-loading" className="explore-loading" role="status">
              Building template landscape…
            </div>

            <aside id="graph-analysis" className="graph-analysis" aria-label="Template landscape community filters">
              <button
                id="all-communities"
                className="community-all active"
                type="button"
                aria-label="Show all communities"
                aria-pressed="true"
              >
                <span aria-hidden="true" />
              </button>
              <div id="community-list" className="community-list" />
              <div id="community-scroll-fade" className="community-scroll-fade" aria-hidden="true" />
            </aside>

            <aside id="plugin-detail" className="graph-detail" aria-labelledby="detail-title" aria-live="polite" hidden>
              <button id="detail-close" className="detail-close" type="button" aria-label="Close template details">
                ×
              </button>
              <span className="panel-kicker">Selected template</span>
              <div className="detail-card-header">
                <div className="detail-card-preview" aria-hidden="true">
                  <img className="detail-preview-image" alt="" decoding="async" hidden />
                  <span className="detail-preview-mark" />
                </div>
                <div className="detail-card-heading">
                  <h2 id="detail-title" />
                  <p className="detail-publisher" />
                </div>
              </div>
              <div className="detail-card-context">
                <span className="detail-community">
                  <i aria-hidden="true" />
                  <span data-detail="community" />
                </span>
                <span className="detail-stars" aria-label="Repository stars">
                  <svg viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M7 .5 8.9 4.6l4.6.6-3.35 3.15L11 13 7 10.75 3 13l.85-4.65L.5 5.2l4.6-.6Z" />
                  </svg>
                  <strong data-detail="stars" />
                </span>
              </div>
              <p className="detail-description" />
              <p className="detail-identity" />
              <div className="detail-tags" />
              <dl className="detail-metrics">
                <div>
                  <dt>Influence</dt>
                  <dd data-detail="influence" />
                </div>
                <div>
                  <dt>Listed</dt>
                  <dd data-detail="listed" />
                </div>
              </dl>
              <div className="detail-actions">
                <a className="button plugin-link">View template →</a>
                <a className="button repo-link" target="_blank" rel="noreferrer">
                  Repository ↗
                </a>
              </div>
              <div className="analysis-section-title">
                <span>Related templates</span>
              </div>
              <div className="neighbor-list" />
            </aside>
          </div>
          <div className="explore-statusbar" aria-live="polite">
            <span>
              <strong id="visible-nodes">0</strong> visible
            </span>
            <span>
              <strong id="total-nodes">0</strong> community templates
            </span>
            <span>
              <strong id="total-edges">0</strong> links
            </span>
            <span>
              <strong id="total-clusters">0</strong> communities
            </span>
            <span id="graph-method" className="status-method">
              Local TF-IDF similarity
            </span>
          </div>
        </section>

        <section id="growth-view" className="explore-view growth-view" role="tabpanel" aria-labelledby="growth-tab" hidden>
          <div className="growth-controls">
            <span className="growth-control-title">Chart Range</span>
            <fieldset className="date-range">
              <legend className="sr-only">Growth chart date range</legend>
              <label>
                <span>From</span>
                <span className="date-input-shell">
                  <input
                    id="growth-from"
                    type="text"
                    name="growth-from"
                    autoComplete="off"
                    readOnly
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="growth-calendar"
                  />
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M5 3v4M19 3v4M3 9h18M4 5h16v16H4z" />
                  </svg>
                </span>
              </label>
              <span aria-hidden="true">→</span>
              <label>
                <span>To</span>
                <span className="date-input-shell">
                  <input
                    id="growth-to"
                    type="text"
                    name="growth-to"
                    autoComplete="off"
                    readOnly
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="growth-calendar"
                  />
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M5 3v4M19 3v4M3 9h18M4 5h16v16H4z" />
                  </svg>
                </span>
              </label>
            </fieldset>
            <div className="growth-presets" role="group" aria-label="Date range presets">
              <button type="button" data-growth-preset="release" aria-pressed="true">
                Since Quattro
              </button>
              <button type="button" data-growth-preset="7" aria-pressed="false">
                7 Days
              </button>
              <button type="button" data-growth-preset="14" aria-pressed="false">
                14 Days
              </button>
              <button type="button" data-growth-preset="all" aria-pressed="false">
                All
              </button>
            </div>
            <div className="growth-projection-row">
              <span id="growth-projection-title" className="growth-control-title">
                Projection
              </span>
              <div className="growth-presets growth-projection-years" role="group" aria-labelledby="growth-projection-title">
                <button
                  type="button"
                  data-projection-year="2026"
                  aria-pressed="false"
                  aria-label="Project to 31 Dec 2026 at the pace since the Quattro release"
                >
                  2026
                </button>
              </div>
            </div>
            <div id="growth-calendar" className="growth-calendar" role="dialog" aria-modal="false" aria-labelledby="growth-calendar-month" hidden>
              <div className="growth-calendar-header">
                <button type="button" data-calendar-nav="-1" aria-label="Previous month">
                  ←
                </button>
                <strong id="growth-calendar-month" aria-live="polite" />
                <button type="button" data-calendar-nav="1" aria-label="Next month">
                  →
                </button>
              </div>
              <div className="growth-calendar-weekdays" aria-hidden="true">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>
              <div id="growth-calendar-grid" className="growth-calendar-grid" role="grid" aria-label="Calendar dates" />
              <div className="growth-calendar-footer">
                <button type="button" data-calendar-bound="minimum">
                  First available
                </button>
                <button type="button" data-calendar-bound="maximum">
                  Latest snapshot
                </button>
              </div>
            </div>
          </div>

          <figure className="growth-poster">
            <figcaption className="growth-poster-header">
              <div className="growth-poster-title">
                <span>Community Registry</span>
                <h2>community templates</h2>
                <p>
                  <span id="growth-method-copy">End-of-day Git catalog snapshots (UTC)</span> ·{" "}
                  <span id="growth-range-copy">since the Quattro release</span>
                </p>
              </div>
              <div className="growth-summary" aria-live="polite">
                <div className="growth-total">
                  <div className="growth-summary-label">
                    <span id="growth-delta" className="growth-delta" aria-label="Net template growth over the selected period">
                      <strong>0</strong>
                      <small>templates</small>
                    </span>
                    <strong id="growth-rate" className="growth-rate" aria-label="Percentage growth over the selected period">
                      <i id="growth-trend-arrow" aria-hidden="true">
                        →
                      </i>
                      <span id="growth-rate-value">0%</span>
                    </strong>
                  </div>
                  <strong>
                    <span id="growth-start-total">0</span>
                    <i aria-hidden="true">→</i>
                    <em id="growth-end-total">0</em>
                  </strong>
                </div>
                <div className="growth-period">
                  <span>Period</span>
                  <strong id="growth-period">0 Days</strong>
                </div>
              </div>
            </figcaption>

            <div
              className="growth-plot-scroll"
              role="region"
              aria-label="Community template growth chart; scroll horizontally on narrow screens"
              tabIndex={0}
            >
              <div className="growth-plot-content">
                <div className="growth-plot-meta">
                  <span>Template Count</span>
                  <span id="growth-as-of">As of</span>
                </div>
                <div className="growth-plot-frame">
                  <svg
                    id="growth-chart"
                    className="growth-chart"
                    viewBox="0 0 1728 620"
                    role="img"
                    aria-label="Community template growth"
                    aria-describedby="growth-chart-description"
                  >
                    <desc id="growth-chart-description">
                      Cumulative community template listings for the selected date range.
                    </desc>
                    <defs>
                      <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#ff5a36" stopOpacity=".25" />
                        <stop offset="1" stopColor="#ff5a36" stopOpacity="0" />
                      </linearGradient>
                      <filter id="growth-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <g data-chart-grid />
                    <path data-chart-area fill="url(#growth-fill)" />
                    <path
                      data-chart-line
                      fill="none"
                      stroke="#ff5a36"
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#growth-glow)"
                    />
                    <g data-release-marker />
                    <g data-chart-projection />
                    <g data-chart-points />
                    <g data-chart-labels />
                    <g className="chart-hover-guide is-hidden" data-chart-hover-guide aria-hidden="true">
                      <line className="chart-hover-line" />
                      <circle className="chart-hover-point" r={8} />
                      <rect className="chart-hover-box" width={198} height={60} />
                      <text className="chart-hover-value" />
                      <text className="chart-hover-date" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            <div className="growth-poster-footer">
              <div className="growth-legend">
                <span>
                  <i className="legend-dot" />
                  <span id="growth-legend-copy">Active community listings</span>
                </span>
                <span>
                  <i className="legend-release" />
                  Litho Quattro v4.0.0 release
                </span>
                <span id="growth-legend-projection" hidden>
                  <i className="legend-projection" />
                  Projection at Quattro pace
                </span>
                <span id="growth-legend-band" hidden>
                  <i className="legend-band" />
                  Slowest–fastest week
                </span>
              </div>
              <span className="growth-source">
                Source · <strong id="growth-source">Git catalog snapshots</strong>
              </span>
            </div>
          </figure>
        </section>

        <p id="explore-error" className="explore-error" role="alert" hidden>
          The explorer data could not be loaded. Try again in a moment.
        </p>
      </main>

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
        <a href="/index.html">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 11.5 12 5l8 6.5V20H4v-8.5Z" />
          </svg>
          Home
        </a>
        <a href="/index.html#catalog">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          Browse
        </a>
        <a className="active" href="/explore.html" aria-current="page">
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

      <SiteEngine engine="explore" />
    </>
  );
}

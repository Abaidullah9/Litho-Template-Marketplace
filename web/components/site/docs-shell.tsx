"use client";

import { useSectionNavigation } from "@/components/site/use-section-navigation";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Toast } from "@/components/site/toast";

export type ShellNavLink = {
  href: string;
  label: string;
  /** Section ids this link highlights; defaults to the link's own hash. */
  ids?: readonly string[];
  arrow?: boolean;
};

const WORKSPACE = "Document templates";

export type ShellNavGroup = { title: string; links: readonly ShellNavLink[] };

const DEFAULT_SIDEBAR_GROUPS: readonly ShellNavGroup[] = [
  {
    title: "Authoring",
    links: [
      { href: "/develop.html", label: "Template guidelines" },
      { href: "/publish.html", label: "Submission guide" },
      { href: "/submit.html", label: "Submit a template", arrow: true },
    ],
  },
  {
    title: "References",
    links: [
      { href: "/publish.html#manifest", label: "Metadata reference", arrow: true },
      { href: "/index.html#catalog", label: "Browse examples", arrow: true },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { href: "/index.html#catalog", label: "Browse templates" },
      { href: "/explore.html", label: "Explore templates" },
      {
        href: "https://github.com/litho-templates/litho-template-marketplace",
        label: "Contribute",
        arrow: true,
      },
    ],
  },
];

const EXTERNAL = "https://github.com/litho-templates/litho-template-marketplace";

function linkIds(link: ShellNavLink) {
  if (link.ids) return link.ids;
  const hash = link.href.includes("#") ? link.href.slice(link.href.indexOf("#") + 1) : "";
  return hash ? [hash] : [];
}

function ShellLink({ link, active }: { link: ShellNavLink; active: boolean }) {
  const external = link.href.startsWith("http");
  return (
    <a
      className={`sidebar-link${active ? " active" : ""}`}
      href={link.href}
      aria-current={active ? "page" : undefined}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {link.label}
      {link.arrow ? <> <span aria-hidden="true">↗</span></> : null}
    </a>
  );
}

type DocsShellProps = {
  skipLabel: string;
  crumbs: React.ReactNode;
  /** Href of the sidebar entry this page owns. */
  current: string;
  sections: readonly string[];
  asideLinks: readonly ShellNavLink[];
  mobileLinks: readonly ShellNavLink[];
  asideExtra: React.ReactNode;
  /** Rail groups; the submission guide carries a shorter set than the guidelines page. */
  sidebarGroups?: readonly ShellNavGroup[];
  /** The one link beside the theme toggle in the topbar. */
  topAction?: ShellNavLink;
  /** Class list on `<main>`; the submission guide leaves off the guideline-only modifier. */
  contentClassName?: string;
  children: React.ReactNode;
};

/**
 * The documentation shell shared by the guideline and submission pages: fixed rail, breadcrumb
 * topbar, right-hand table of contents, and the mobile bar that mirrors it.
 */
export function DocsShell({
  skipLabel,
  crumbs,
  current,
  sections,
  asideLinks,
  mobileLinks,
  asideExtra,
  sidebarGroups = DEFAULT_SIDEBAR_GROUPS,
  topAction = { href: "/submit.html", label: "Submit" },
  contentClassName = "page-content development-guide",
  children,
}: DocsShellProps) {
  const { activeId, pin } = useSectionNavigation({
    sectionIds: sections,
    markerRatio: 0.25,
    markerMax: 160,
    activateLastAtPageEnd: true,
  });

  return (
    <>
      <a className="skip-link" href="#main-content">
        {skipLabel}
      </a>
      <div className="app-shell">
        <aside className="left-sidebar">
          <div className="sidebar-brand">
            <a href="/index.html" aria-label="Template Marketplace home">
              <img
                src="/assets/img/litho-wordmark.png?v=20261007-01"
                alt=""
                width="656"
                height="192"
              />
              <span>TEMPLATE MARKETPLACE</span>
            </a>
          </div>
          <div className="sidebar-section">
            <span className="label">Workspace</span>
            <div className="workspace-select">
              <span className="workspace-dot" aria-hidden="true" />
              {WORKSPACE}
            </div>
          </div>
          {sidebarGroups.map((group) => (
            <div className="sidebar-group" key={group.title}>
              <div className="sidebar-group-title">{group.title}</div>
              {group.links.map((link) => (
                <ShellLink key={`${group.title}-${link.href}-${link.label}`} link={link} active={link.href === current} />
              ))}
            </div>
          ))}
          <div className="sidebar-bottom">
            <a className="sidebar-link" href="/index.html">
              ← Back to marketplace
            </a>
          </div>
        </aside>
        <div className="center-panel">
          <header className="doc-topbar">
            <div className="crumbs">{crumbs}</div>
            <div className="top-actions">
              <a className="square-action desktop-only" href={topAction.href}>
                {topAction.label}
              </a>
              <ThemeToggle />
            </div>
          </header>
          <main id="main-content" className={contentClassName} tabIndex={-1}>
            {children}
          </main>
        </div>
        <aside className="right-aside">
          <div className="aside-block">
            <span className="aside-title">On this page</span>
            {asideLinks.map((link) => {
              const active = linkIds(link).includes(activeId);
              return (
                <a
                  className={`aside-link${active ? " active" : ""}`}
                  href={link.href}
                  key={link.href}
                  aria-current={active ? "location" : undefined}
                  onClick={() => pin(link.href.slice(1))}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="aside-block">
            <span className="aside-title">Metadata</span>
            <dl className="aside-meta">{asideExtra}</dl>
          </div>
        </aside>
      </div>
      <nav className="mobile-bottom" aria-label="Mobile navigation">
        {mobileLinks.map((link) => {
          const active = linkIds(link).includes(activeId);
          return (
            <a
              className={active ? "active" : undefined}
              href={link.href}
              key={link.href}
              data-section-ids={link.ids?.length ? link.ids.join(" ") : undefined}
              onClick={() => {
                const id = link.href.startsWith("#") ? link.href.slice(1) : "";
                if (id) pin(id);
              }}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
      <Toast />
    </>
  );
}

export { EXTERNAL as DOCS_CONTRIBUTE_URL };

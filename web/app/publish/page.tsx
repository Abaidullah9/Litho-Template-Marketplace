import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { DocsShell, type ShellNavGroup, type ShellNavLink } from "@/components/site/docs-shell";

export const metadata: Metadata = {
  title: "Submit a Template | Template Marketplace",
  description: "Submit an academic or technical template to the marketplace.",
};

const SECTIONS = ["overview", "requirements", "manifest", "submit"];

const SIDEBAR_GROUPS: readonly ShellNavGroup[] = [
  {
    title: "Authoring",
    links: [
      { href: "/develop.html", label: "Template guidelines" },
      { href: "/publish.html", label: "Submission guide" },
      { href: "/submit.html", label: "Submit a template", arrow: true },
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

const ASIDE_LINKS: readonly ShellNavLink[] = [
  { href: "#overview", label: "Overview" },
  { href: "#requirements", label: "Prepare" },
  { href: "#manifest", label: "Metadata" },
  { href: "#submit", label: "Submit" },
];

const MOBILE_LINKS: readonly ShellNavLink[] = [
  { href: "/index.html", label: "Browse" },
  { href: "#overview", label: "Guide", ids: ["overview", "requirements"] },
  { href: "#manifest", label: "Metadata" },
  { href: "#submit", label: "Submit" },
];

const CHECKLIST = [
  { marker: "✓", label: "A download URL or public repository" },
  { marker: "✓", label: "Name, short description and category" },
  { marker: "✓", label: "README and licence inside the package" },
  { marker: "✓", label: "A preview image of the rendered output" },
  { marker: "+", label: "Optional sample file and extra preview images" },
];

const FIELD_ROWS: readonly { field: string; purpose: string; required: string }[] = [
  { field: "name", purpose: "Human-readable template name", required: "Yes" },
  { field: "description", purpose: "Short catalog summary, up to 600 characters", required: "Yes" },
  { field: "category", purpose: "Category shown in the catalog filter bar", required: "No" },
  { field: "publisher", purpose: "Existing publisher or a new name to create", required: "No" },
  { field: "tags", purpose: "Up to 10 comma-separated tags", required: "No" },
  { field: "downloadUrl", purpose: "Direct download of the template package", required: "One of" },
  { field: "repositoryUrl", purpose: "Public source repository", required: "One of" },
  { field: "previewImage", purpose: "First-page screenshot or rendered output", required: "No" },
];

/** Transcribed from the page's `data-copy` attribute so the button copies identical bytes. */
const REVIEW_CHECKLIST = [
  "Name: IEEE Conference Paper",
  "Description: One or two sentences shown on the card.",
  "Category: Academic",
  "Download URL: https://example.org/ieee-paper.zip",
  "Repository: https://github.com/you/ieee-paper (optional)",
  "Licence: MIT",
].join("\n");

const ASIDE_META = (
  <>
    <div>
      <dt>Status</dt>
      <dd>
        <span className="status-label">Stable</span>
      </dd>
    </div>
    <div>
      <dt>Owner</dt>
      <dd>
        <a href="https://github.com/HANCORE-linux" target="_blank" rel="noreferrer">
          HANCORE
        </a>
      </dd>
    </div>
    <div>
      <dt>Visibility</dt>
      <dd>Public</dd>
    </div>
    <div>
      <dt>Updated</dt>
      <dd>
        <time dateTime="2026-10-04T10:00:00+02:00">
          <span>4 Oct 2026</span>
          <small>10:00 CEST</small>
        </time>
      </dd>
    </div>
  </>
);

const GAP = "\u00a0";

export default function PublishPage() {
  return (
    <DocsShell
      skipLabel="Skip to submission guide"
      crumbs={
        <>
          <span>Marketplace / </span>
          <b>Submit</b>
        </>
      }
      current="/publish.html"
      sections={SECTIONS}
      asideLinks={ASIDE_LINKS}
      mobileLinks={MOBILE_LINKS}
      asideExtra={ASIDE_META}
      sidebarGroups={SIDEBAR_GROUPS}
      topAction={{ href: "/index.html", label: "Browse" }}
      contentClassName="page-content"
    >
      <header className="page-header" id="overview">
        <div className="page-eyebrow">Submitting</div>
        <h1>Submit your template</h1>
        <div className="page-meta">
          <span>
            <time dateTime="2026-10-04">Updated 4 Oct 2026</time>
          </span>
          <span>3 min read</span>
          <span className="status">
            <i className="status-dot" aria-hidden="true" />
            Stable
          </span>
        </div>
      </header>
      <p className="intro">
        List your template in three steps. Publish the files in a public repository or provide a direct download, then
        send the submission form. An administrator reviews every entry.
      </p>
      <p className="official-reference">
        Writing the files? Start with the <a href="/develop.html">template guidelines →</a>.
      </p>
      <div className="callout prominent-callout">
        <strong>The marketplace reviews listings, not content.</strong>
        <p>
          Verification checks the metadata, links and preview. You remain responsible for your files, documentation, and
          licence.
        </p>
      </div>

      <section className="docs-section" id="requirements">
        <span className="step-number">01</span>
        <h2>Prepare the files</h2>
        <p>Prepare these before you submit:</p>
        <ul className="check-list compact-check-list">
          {CHECKLIST.map((item) => (
            <li key={item.label}>
              <span aria-hidden="true">{item.marker}</span>
              <div>
                <strong>{item.label}</strong>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="docs-section" id="manifest">
        <span className="step-number">02</span>
        <h2>Describe the template</h2>
        <p>
          The submission form collects the metadata the catalog renders on your detail page. Keep the description honest
          — reviewers compare it against the files.
        </p>
        <p>
          Fields like <code className="inline-code" translate="no">downloadUrl</code> and{" "}
          <code className="inline-code" translate="no">repositoryUrl</code> must resolve publicly before you submit —
          dead links are the most common rejection.
        </p>
        <p className="official-reference">
          See the <a href="/develop.html">template guidelines</a> for the expected package layout and preview
          requirements.
        </p>
        <CodeBlock title={<>Text {GAP} what reviewers check</>} copy={{ value: REVIEW_CHECKLIST }}>
          <pre>
            <code>
              <span className="syntax-key">Name</span>
              {": "}
              <span className="syntax-string">IEEE Conference Paper</span>
              {"\n"}
              <span className="syntax-key">Description</span>
              {": "}
              <span className="syntax-string">One or two sentences shown on the card.</span>
              {"\n"}
              <span className="syntax-key">Category</span>
              {": "}
              <span className="syntax-string">Academic</span>
              {"\n"}
              <span className="syntax-key">Download URL</span>
              {": "}
              <span className="syntax-string">https://example.org/ieee-paper.zip</span>
              {"\n"}
              <span className="syntax-key">Repository</span>
              {": "}
              <span className="syntax-string">https://github.com/you/ieee-paper (optional)</span>
              {"\n"}
              <span className="syntax-key">Licence</span>
              {": "}
              <span className="syntax-string">MIT</span>
            </code>
          </pre>
        </CodeBlock>
        <details className="manifest-reference">
          <summary>Field reference</summary>
          <div className="field-table">
            <div className="field-row header">
              <span>Field</span>
              <span>Purpose</span>
              <span>Required</span>
            </div>
            {FIELD_ROWS.map((row) => (
              <div className="field-row" key={row.field}>
                <code>{row.field}</code>
                <span>{row.purpose}</span>
                <b>{row.required}</b>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="docs-section" id="submit">
        <span className="step-number">03</span>
        <h2>Submit for review</h2>
        <p>
          Open the submission form, fill in the metadata, and attach a preview. Your entry enters the queue as{" "}
          <em>pending</em>; nothing appears publicly until an administrator approves it. Rejections come with a reason
          you can act on.
        </p>
        <p className="submit-action">
          <a className="button publish-primary" href="/submit.html">
            Submit your template <span aria-hidden="true">→</span>
          </a>
        </p>
      </section>
    </DocsShell>
  );
}

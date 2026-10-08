import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { DocsShell, type ShellNavLink } from "@/components/site/docs-shell";
import {
  entryDocument,
  licenseText,
  metadataDraft,
  packageSizeCommand,
  packageTree,
  previewCommands,
  readmeDocument,
  renderCommand,
  validationCommands,
} from "./content";

export const metadata: Metadata = {
  title: "Template Guidelines | Template Marketplace",
  description: "Package and validate an academic or technical template for the marketplace.",
};

const SECTIONS = ["overview", "start", "contract", "entry-point", "validate", "run", "finished", "troubleshooting"];

const ASIDE_LINKS: readonly ShellNavLink[] = [
  { href: "#overview", label: "Overview" },
  { href: "#start", label: "Prepare" },
  { href: "#contract", label: "Metadata" },
  { href: "#entry-point", label: "Entry document" },
  { href: "#validate", label: "Validate" },
  { href: "#run", label: "Preview" },
  { href: "#finished", label: "Finished example" },
  { href: "#troubleshooting", label: "Troubleshooting" },
];

const MOBILE_LINKS: readonly ShellNavLink[] = [
  { href: "/index.html", label: "Browse" },
  { href: "#overview", label: "Start", ids: ["overview", "start"] },
  { href: "#contract", label: "Build", ids: ["contract", "entry-point", "validate", "run"] },
  { href: "#finished", label: "Finish", ids: ["finished", "troubleshooting"] },
];

const ASIDE_META = (
  <>
    <div>
      <dt>Status</dt>
      <dd>
        <span className="status-label">Stable</span>
      </dd>
    </div>
    <div>
      <dt>Audience</dt>
      <dd>Authors</dd>
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
      <dt>Updated</dt>
      <dd>
        <time dateTime="2026-10-04">
          <span>4 Oct 2026</span>
        </time>
      </dd>
    </div>
  </>
);

function Callout({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="callout">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="inline-code" translate="no">
      {children}
    </code>
  );
}

const GAP = "\u00a0";

export default function DevelopPage() {
  return (
    <DocsShell
      skipLabel="Skip to template guidelines"
      crumbs={
        <>
          <span>Marketplace / </span>
          <b>Guidelines</b>
        </>
      }
      current="/develop.html"
      sections={SECTIONS}
      asideLinks={ASIDE_LINKS}
      mobileLinks={MOBILE_LINKS}
      asideExtra={ASIDE_META}
    >
      <header className="page-header" id="overview">
        <div className="page-eyebrow">Guidelines</div>
        <h1>Author a Template Package</h1>
        <div className="page-meta">
          <span>
            <time dateTime="2026-10-04">Updated 4 Oct 2026</time>
          </span>
          <span>10 min read</span>
          <span className="status">
            <i className="status-dot" aria-hidden="true" />
            Stable
          </span>
        </div>
      </header>
      <p className="intro">
        Assemble a self-contained document package, describe it with honest metadata, render it once to produce the
        preview, and run the same checks an administrator performs during review.
      </p>
      <div className="callout">
        <strong>Templates are plain files people will build on.</strong>
        <p>
          Keep every dependency inside the package, state the licence clearly, and never embed fonts, images, or code
          you are not allowed to redistribute.
        </p>
      </div>

      <section className="docs-section" id="start">
        <span className="step-number">01</span>
        <h2>Prepare the Package</h2>
        <p>
          This walkthrough packages a small conference paper with a bibliography, so a minimal LaTeX project is the
          closest working starting point.
        </p>
        <ul className="check-list">
          <li>
            <span aria-hidden="true">1</span>
            <div>
              <strong>Match the package layout</strong>
              <small>
                Keep one entry document at the root, next to the README, licence, and preview — the catalog renders
                exactly what it finds.
              </small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">2</span>
            <div>
              <strong>Work in a clean copy</strong>
              <small>Strip editor build artefacts, absolute paths, and personal notes before packaging.</small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">3</span>
            <div>
              <strong>Expect a first render</strong>
              <small>The entry document must compile from a fresh checkout with no extra setup.</small>
            </div>
          </li>
        </ul>
        <CodeBlock
          title={<>Terminal {GAP} create local copy</>}
          copy={{ value: renderCommand, ariaLabel: "Copy render command" }}
        >
          <pre>
            <code>{renderCommand}</code>
          </pre>
        </CodeBlock>
        <p>
          A successful run writes <InlineCode>main.pdf</InlineCode> beside the sources and reports no undefined
          references. The finished folder looks like this:
        </p>
        <CodeBlock title={<>Files {GAP} template package</>}>
          <pre>
            <code>{packageTree}</code>
          </pre>
        </CodeBlock>
        <div className="callout">
          <strong>Keep the package name stable.</strong>
          <p>
            The folder name becomes the listing identifier, for example <InlineCode>ieee-conference-paper</InlineCode>.
            Choose it before submitting — renaming later breaks the links people already shared.
          </p>
          <code
            className="inline-code callout-command"
            translate="no"
            tabIndex={0}
            role="region"
            aria-label="Package size check command"
          >
            {packageSizeCommand}
          </code>
          <p>Keep the archive under 15{GAP}MB so the review upload stays fast.</p>
        </div>
        <p className="official-reference">
          Browse the <a href="/index.html#catalog">published templates ↗</a> before designing a new package from
          scratch.
        </p>
      </section>

      <section className="docs-section" id="contract">
        <span className="step-number">02</span>
        <h2>Describe the Metadata</h2>
        <p>
          The catalog card is built from the metadata you send with the submission. Use this reference when deciding
          what to fill in.
        </p>
        <div className="kind-reference" tabIndex={0} role="region" aria-labelledby="kind-reference-title">
          <table>
            <caption className="sr-only" id="kind-reference-title">
              Template metadata reference
            </caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Example</th>
                <th scope="col">Required</th>
                <th scope="col">Use it for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>name</code>
                </td>
                <td>
                  <code>IEEE Conference Paper</code>
                </td>
                <td>Yes</td>
                <td>Card and detail heading</td>
              </tr>
              <tr>
                <td>
                  <code>description</code>
                </td>
                <td>
                  <code>Two-sentence summary</code>
                </td>
                <td>Yes</td>
                <td>Catalog card copy</td>
              </tr>
              <tr>
                <td>
                  <code>category</code>
                </td>
                <td>
                  <code>Academic</code>
                </td>
                <td>No</td>
                <td>Filter bar grouping</td>
              </tr>
              <tr>
                <td>
                  <code>tags</code>
                </td>
                <td>
                  <code>LaTeX, Research</code>
                </td>
                <td>No</td>
                <td>Search and related lists</td>
              </tr>
              <tr>
                <td>
                  <code>license</code>
                </td>
                <td>
                  <code>MIT</code>
                </td>
                <td>No</td>
                <td>Terms of use section</td>
              </tr>
              <tr>
                <td>
                  <code>downloadUrl</code>
                </td>
                <td>
                  <code>…/paper.zip</code>
                </td>
                <td>One of</td>
                <td>Download button</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          For this walkthrough, keep the metadata next to the files it describes, and record it in the README so
          reviewers can compare both:
        </p>
        <details className="manifest-reference development-example">
          <summary>
            <span>Text {GAP} metadata draft</span>
          </summary>
          <CodeBlock
            title={<>Text {GAP} metadata draft</>}
            copy={{ value: metadataDraft, ariaLabel: "Copy development metadata draft" }}
          >
            <pre>
              <code>
                name: <span className="syntax-string">IEEE Conference Paper</span>
                {"\n"}
                description: <span className="syntax-string">A conference paper template with figure, table and citation helpers.</span>
                {"\n"}
                category: <span className="syntax-string">Academic</span>
                {"\n"}
                tags: <span className="syntax-string">LaTeX, Research, University</span>
                {"\n"}
                license: <span className="syntax-string">MIT</span>
                {"\n"}
                downloadUrl: <span className="syntax-string">https://example.org/ieee-paper.zip</span>
              </code>
            </pre>
          </CodeBlock>
        </details>
        <Callout title="The description is a promise.">
          Write what the template actually contains — sections, bibliography style, compile requirements. Reviewers
          reject listings whose description and files disagree.
        </Callout>
      </section>

      <section className="docs-section" id="entry-point">
        <span className="step-number">03</span>
        <h2>Write the Entry Document</h2>
        <p>
          <InlineCode>main.tex</InlineCode> is the document the reviewer compiles first. It should open with the class
          declaration, pull the bibliography from the same folder, and compile without local configuration.
        </p>
        <details className="manifest-reference development-example">
          <summary>
            <span>TeX {GAP} main.tex</span>
          </summary>
          <CodeBlock
            title={<>TeX {GAP} main.tex</>}
            copy={{ value: entryDocument, ariaLabel: "Copy development main.tex" }}
          >
            <pre>
              <code>
                <span className="syntax-key">\documentclass</span>
                {"[conference]{IEEEtran}\n\n"}
                <span className="syntax-key">\usepackage</span>
                {"{graphicx}\n"}
                <span className="syntax-key">\usepackage</span>
                {"{cite}\n\n"}
                <span className="syntax-key">\title</span>
                {"{A Reusable Conference Paper Template}\n"}
                <span className="syntax-key">\author</span>
                {"{Your Name \\and Co-Author}\n\n"}
                <span className="syntax-key">\begin</span>
                {"{document}\n"}
                <span className="syntax-key">\maketitle</span>
                {"\n\n"}
                <span className="syntax-key">\begin</span>
                {"{abstract}\nSummarise the contribution in three or four sentences.\n"}
                <span className="syntax-key">\end</span>
                {"{abstract}\n\n"}
                <span className="syntax-key">\section</span>
                {"{Introduction}\nState the problem, the approach, and the result.\n\n"}
                <span className="syntax-key">\bibliographystyle</span>
                {"{IEEEtran}\n"}
                <span className="syntax-key">\bibliography</span>
                {"{references}\n"}
                <span className="syntax-key">\end</span>
                {"{document}\n"}
              </code>
            </pre>
          </CodeBlock>
        </details>
        <p>
          Next, record how a reader installs and removes the package in <InlineCode>README.md</InlineCode>:
        </p>
        <details className="manifest-reference development-example">
          <summary>
            <span>Markdown {GAP} README.md</span>
          </summary>
          <CodeBlock
            title={<>Markdown {GAP} README.md</>}
            copy={{ value: readmeDocument, ariaLabel: "Copy development README.md" }}
          >
            <pre>
              <code>{readmeDocument}</code>
            </pre>
          </CodeBlock>
        </details>
        <Callout title="Both files describe one package.">
          The README’s compile steps must match the entry document, and the metadata description must match both.
          Reviewers check all three against each other.
        </Callout>
        <p className="official-reference">
          This structure follows the marketplace’s <a href="/index.html#catalog">published templates</a>. The{" "}
          <a href="/publish.html#manifest">metadata reference ↗</a> remains the source of truth for the submission
          fields.
        </p>
      </section>

      <section className="docs-section" id="validate">
        <span className="step-number">04</span>
        <h2>Validate the Package</h2>
        <p>
          Check the package the way review does: compile from a clean directory, confirm every referenced file exists,
          and confirm the licence is present.
        </p>
        <CodeBlock
          title={<>Terminal {GAP} validate</>}
          copy={{ value: validationCommands, ariaLabel: "Copy validation commands" }}
        >
          <pre>
            <code>{validationCommands}</code>
          </pre>
        </CodeBlock>
        <p>Both commands should exit without an error. A missing dependency gives an actionable message, for example:</p>
        <CodeBlock title={<>Example {GAP} validation failure</>}>
          <pre>
            <code>! LaTeX Error: File `template.sty&apos; not found.</code>
          </pre>
        </CodeBlock>
        <ul className="check-list">
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>The entry document compiles</strong>
              <small>
                <InlineCode>main.tex</InlineCode> builds from a fresh checkout with no undefined references.
              </small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Every referenced file is bundled</strong>
              <small>
                Bibliographies, images, and style files ship inside the package, never on your disk only.
              </small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>README and licence agree with the metadata</strong>
              <small>Name, description, and licence match the submission form exactly.</small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>No build artefacts or secrets</strong>
              <small>
                No <InlineCode>.aux</InlineCode> leftovers, absolute paths, tokens, or personal data.
              </small>
            </div>
          </li>
        </ul>
      </section>

      <section className="docs-section" id="run">
        <span className="step-number">05</span>
        <h2>Render the Preview</h2>
        <p>The preview image is what shoppers see first. Render the final PDF and export its first page at a readable size:</p>
        <CodeBlock
          title={<>Terminal {GAP} export preview</>}
          copy={{ value: previewCommands, ariaLabel: "Copy preview command" }}
        >
          <pre>
            <code>{previewCommands}</code>
          </pre>
        </CodeBlock>
        <p>
          The command writes <InlineCode>preview.png</InlineCode> beside the sources. Open it once and confirm the text
          is legible — the catalog scales it down, but never up:
        </p>
        <CodeBlock title={<>Example {GAP} preview properties</>}>
          <pre>
            <code>
              {"{\n  "}
              <span className="syntax-key">&quot;file&quot;</span>
              {": "}
              <span className="syntax-string">&quot;preview.png&quot;</span>
              {",\n  "}
              <span className="syntax-key">&quot;recommendedWidth&quot;</span>
              {": "}
              <span className="syntax-number">1600</span>
              {",\n  "}
              <span className="syntax-key">&quot;formats&quot;</span>
              {": ["}
              <span className="syntax-string">&quot;png&quot;</span>
              {", "}
              <span className="syntax-string">&quot;jpg&quot;</span>
              {", "}
              <span className="syntax-string">&quot;webp&quot;</span>
              {"]\n}"}
            </code>
          </pre>
        </CodeBlock>
        <p>
          Before sharing, re-run the compile after a clean, click through the preview, check the download link from a
          private window, and confirm the licence text opens. If the package does not compile, continue to
          Troubleshooting below.
        </p>
      </section>

      <section className="docs-section" id="finished">
        <span className="step-number">06</span>
        <h2>Finished Example</h2>
        <p>
          After testing, remove any machine-specific paths, keep the folder name identical to the listing identifier,
          and place these files in a public repository or a zip archive, then select a file to inspect or copy it.
        </p>
        <div className="example-file-tree" role="group" aria-label="Finished conference paper repository files">
          <div className="example-tree-root">
            <code>ieee-conference-paper/</code>
            <small>Select a file to inspect it</small>
          </div>
          <details className="manifest-reference example-file">
            <summary>
              <span>
                <span className="tree-branch" aria-hidden="true" />
                <code>main.tex</code>
              </span>
            </summary>
            <CodeBlock title={<>TeX {GAP} main.tex</>} copy={{ value: entryDocument, ariaLabel: "Copy finished main.tex" }}>
              <pre>
                <code>
                  <span className="syntax-key">\documentclass</span>
                  {"[conference]{IEEEtran}\n\n"}
                  <span className="syntax-key">\usepackage</span>
                  {"{graphicx}\n"}
                  <span className="syntax-key">\usepackage</span>
                  {"{cite}\n\n"}
                  <span className="syntax-key">\title</span>
                  {"{A Reusable Conference Paper Template}\n"}
                  <span className="syntax-key">\author</span>
                  {"{Your Name \\and Co-Author}\n\n"}
                  <span className="syntax-key">\begin</span>
                  {"{document}\n"}
                  <span className="syntax-key">\maketitle</span>
                  {"\n\n"}
                  <span className="syntax-key">\begin</span>
                  {"{abstract}\nSummarise the contribution in three or four sentences.\n"}
                  <span className="syntax-key">\end</span>
                  {"{abstract}\n\n"}
                  <span className="syntax-key">\section</span>
                  {"{Introduction}\nState the problem, the approach, and the result.\n\n"}
                  <span className="syntax-key">\bibliographystyle</span>
                  {"{IEEEtran}\n"}
                  <span className="syntax-key">\bibliography</span>
                  {"{references}\n"}
                  <span className="syntax-key">\end</span>
                  {"{document}\n"}
                </code>
              </pre>
            </CodeBlock>
          </details>
          <details className="manifest-reference example-file">
            <summary>
              <span>
                <span className="tree-branch" aria-hidden="true" />
                <code>README.md</code>
              </span>
            </summary>
            <CodeBlock title={<>Markdown {GAP} README.md</>} copy={{ value: readmeDocument, ariaLabel: "Copy finished README.md" }}>
              <pre>
                <code>{readmeDocument}</code>
              </pre>
            </CodeBlock>
          </details>
          <details className="manifest-reference example-file">
            <summary>
              <span>
                <span className="tree-branch" aria-hidden="true" />
                <code>LICENSE</code>
              </span>
            </summary>
            <CodeBlock title={<>Text {GAP} LICENSE</>} copy={{ value: licenseText, ariaLabel: "Copy finished LICENSE" }}>
              <pre>
                <code>{licenseText}</code>
              </pre>
            </CodeBlock>
          </details>
        </div>
        <p>
          An optional <InlineCode>preview.png</InlineCode> can sit beside these files; it is binary, so it is not
          included in the copy-ready tree.
        </p>
        <Callout title="Use this as a structural reference.">
          Do not copy the name, repository URL, author, or description unchanged. Document every external dependency,
          font, data file, or online service your template relies on.
        </Callout>
      </section>

      <section className="docs-section" id="troubleshooting">
        <span className="step-number">Reference</span>
        <h2>Troubleshooting</h2>
        <ul className="check-list troubleshooting-list">
          <li>
            <span aria-hidden="true">!</span>
            <div>
              <strong>Package Does Not Compile</strong>
              <p>Compile from a fresh copy of the folder; a file that only exists on your machine is the usual cause.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">!</span>
            <div>
              <strong>Bibliography Entries Missing</strong>
              <p>
                Run <InlineCode>bibtex main</InlineCode> between the <InlineCode>pdflatex</InlineCode> passes so{" "}
                <InlineCode>references.bib</InlineCode> is actually read.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">!</span>
            <div>
              <strong>The Listing Was Rejected</strong>
              <p>
                Read the rejection reason on the submission, fix exactly that, and submit again — every rejection comes
                with a reason.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">!</span>
            <div>
              <strong>The Preview Looks Blurry</strong>
              <p>Re-export at 150{GAP}DPI or higher; the catalog never upscales the image it is given.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">!</span>
            <div>
              <strong>The Download Link 404s</strong>
              <p>
                Confirm the URL resolves from a private window; links to local or private repositories are rejected
                during review.
              </p>
            </div>
          </li>
        </ul>
        <p className="submit-action">
          <a className="button publish-primary" href="/publish.html">
            Continue to the Submission Guide <span aria-hidden="true">→</span>
          </a>
        </p>
      </section>
    </DocsShell>
  );
}

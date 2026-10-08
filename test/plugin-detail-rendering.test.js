import assert from "node:assert/strict";
import test from "node:test";
import { detailTemplate, setupPreviewLightbox } from "../site/assets/js/plugin.js";

function templateListing(overrides = {}) {
  return {
    id: "example-research.latex-report",
    slug: "latex-report",
    name: "LaTeX Report",
    initials: "LR",
    category: { name: "Academic" },
    author: "Example Maintainer",
    publisher: { name: "Example Maintainer" },
    description: "A report template used by rendering tests.",
    tags: ["latex", "research"],
    accent: "lime",
    version: "1.0.0",
    license: "MIT",
    status: "published",
    verified: false,
    verificationMethod: "manual",
    downloadUrl: "https://example.test/latex-report.zip",
    repositoryUrl: "https://github.com/example/latex-report",
    ...overrides,
  };
}

function render(overrides = {}) {
  return detailTemplate(templateListing(overrides), { views: 0, downloads: 0 });
}

/** The detail page renders its sections in a fixed reading order. */
function assertSectionOrder(html) {
  const download = html.indexOf('id="download"');
  const details = html.indexOf('id="details"');
  const verification = html.indexOf('id="verification"');
  const terms = html.indexOf('id="terms"');
  assert.ok(download >= 0 && details > download && verification > details && terms > verification);
}

test("template details render download, details, verification, and terms in order", () => {
  const html = render();

  assertSectionOrder(html);
  assert.match(html, /<h2>Download<\/h2>/);
  assert.match(html, /data-download-id="example-research\.latex-report"/);
  assert.match(html, /Download template/);
  assert.match(html, /Downloads are served by the marketplace\. Check the licence before you reuse the files\./);
  assert.match(html, /<h2>Details<\/h2>/);
  assert.match(html, /<h2>Verification status<\/h2>/);
  assert.match(html, /<h2>Terms of Use<\/h2>/);
  assert.match(html, /href="submit\.html"/);
  assert.doesNotMatch(html, /installCommand|data-install-copy|litho plugin/);
});

test("listings without any download render the browse-only placeholder", () => {
  const html = render({ downloadUrl: "", repositoryUrl: "" });

  assertSectionOrder(html);
  assert.match(html, /<strong>No download yet<\/strong>/);
  assert.match(html, /listed for browsing only/);
  assert.doesNotMatch(html, /data-download-id=/);
});

test("repository, documentation, and sample links ride alongside the download", () => {
  const html = render({
    documentationUrl: "https://example.test/docs",
    sampleFile: "https://example.test/sample.pdf",
  });

  assert.match(html, /href="https:\/\/example\.test\/docs" target="_blank" rel="noreferrer">Documentation/);
  assert.match(html, /href="https:\/\/example\.test\/sample\.pdf" target="_blank" rel="noreferrer">Sample file/);
  assert.match(html, /href="https:\/\/github\.com\/example\/latex-report" target="_blank" rel="noreferrer">Repository/);
});

test("detail tags use the curated Games, Security, and AI labels", () => {
  const html = render({ tags: ["games", "security", "ai", "quickshell"] });
  assert.match(html, /<span class="tag">Games<\/span>/);
  assert.match(html, /<span class="tag">Security<\/span>/);
  assert.match(html, /<span class="tag">AI<\/span>/);
  assert.match(html, /<span class="tag">quickshell<\/span>/);
});

test("template preview uses an escaped native button", () => {
  const html = render({
    name: `\"><span data-injected>Unsafe</span>`,
    previewImage: "assets/img/templates/example-detail.webp",
    previewWidth: 1200,
    previewHeight: 800,
  });

  assert.match(html, /<button class="detail-preview" type="button" data-preview-open/);
  assert.match(html, /aria-label="Open &quot;&gt;&lt;span data-injected&gt;Unsafe&lt;\/span&gt; preview"/);
  assert.match(html, /alt="&quot;&gt;&lt;span data-injected&gt;Unsafe&lt;\/span&gt; template preview"/);
  assert.doesNotMatch(html, /<figure class="detail-preview"|<span data-injected>/);
});

test("preview lightbox keeps untrusted alt text inert and restores focus", () => {
  const listenersFor = (element) => {
    element.listeners = new Map();
    element.addEventListener = (type, listener) => element.listeners.set(type, listener);
    return element;
  };
  const document = {
    createElement(tagName) {
      const element = listenersFor({ tagName, attributes: {} });
      element.setAttribute = (name, value) => { element.attributes[name] = String(value); };
      return element;
    },
  };
  const unsafeAlt = `\"><img src=x onerror=alert(1)> template preview`;
  const previewImage = {
    alt: unsafeAlt,
    currentSrc: "",
    src: "https://example.test/fallback.webp",
    getAttribute: (name) => ({ width: "1200", height: "800" })[name] || null,
  };
  const trigger = listenersFor({
    dataset: { fullSrc: "assets/img/templates/example-detail.webp" },
    querySelector: (selector) => selector === "img" ? previewImage : null,
    focusOptions: null,
    focus(options) { this.focusOptions = options; },
  });
  const root = {
    ownerDocument: document,
    querySelector: (selector) => selector === "[data-preview-open]" ? trigger : null,
  };
  const dialog = listenersFor({
    open: false,
    children: [],
    closeCount: 0,
    replaceChildren(...children) { this.children = children; },
    showModal() { this.open = true; },
    close() { this.closeCount += 1; },
  });
  Object.defineProperty(dialog, "innerHTML", {
    set() { assert.fail("Lightbox content must not use innerHTML"); },
  });

  setupPreviewLightbox(root, dialog);
  trigger.listeners.get("click")();

  assert.equal(dialog.open, true);
  assert.equal(dialog.children.length, 2);
  const [closeButton, fullImage] = dialog.children;
  assert.equal(closeButton.tagName, "button");
  assert.equal(closeButton.attributes["aria-label"], "Close preview");
  assert.equal(fullImage.tagName, "img");
  assert.equal(fullImage.src, "assets/img/templates/example-detail.webp");
  assert.equal(fullImage.alt, unsafeAlt);
  assert.equal(fullImage.width, 1200);
  assert.equal(fullImage.height, 800);

  closeButton.listeners.get("click")();
  dialog.listeners.get("click")({ target: dialog });
  assert.equal(dialog.closeCount, 2);

  dialog.listeners.get("close")();
  assert.deepEqual(dialog.children, []);
  assert.deepEqual(trigger.focusOptions, { preventScroll: true });
});

test("unverified listings fail closed with the review-pending notice", () => {
  const html = render();

  assertSectionOrder(html);
  assert.match(html, /<li class="verification-unverified"><strong>Unverified:<\/strong> This listing has not been reviewed yet\. Review the files before you use them\.<\/li>/);
  assert.match(html, /<strong>Method:<\/strong> manual/);
  assert.doesNotMatch(html, /<strong>Verified:<\/strong>|<strong>Score:<\/strong>/);
  assert.doesNotMatch(html, /card-verification is-verified/);
});

test("verified listings render the reason, method, date, and score", () => {
  const html = render({
    verified: true,
    verificationReason: "An administrator checked the repository and preview.",
    verificationMethod: "manual",
    verificationScore: 0.87,
    verifiedAt: "2026-08-20T12:00:00.000Z",
  });

  assertSectionOrder(html);
  assert.match(html, /<li class="verification-snapshot"><strong>Verified:<\/strong> An administrator checked the repository and preview\.<\/li>/);
  assert.match(html, /<strong>Method:<\/strong> manual · checked /);
  assert.match(html, /<strong>Score:<\/strong> 87%/);
  assert.match(html, /aria-label="Verified"[\s\S]*card-verification-marker">Verified</);
  assert.doesNotMatch(html, /verification-unverified/);
});

test("AI verification labels itself without changing the section contract", () => {
  const html = render({
    verified: true,
    verificationMethod: "ai",
    verificationReason: "Automated checks matched the declared files.",
  });

  assert.match(html, /aria-label="AI verified"[\s\S]*card-verification-marker">AI verified</);
  assert.match(html, /<strong>Method:<\/strong> ai/);
  assertSectionOrder(html);
});

test("the header status distinguishes published from draft listings", () => {
  const published = render();
  assert.match(published, /<span class="status "><i class="status-dot" aria-hidden="true"><\/i>Available<\/span>/);

  const draft = render({ status: "draft" });
  assert.match(draft, /<span class="status is-caution"><i class="status-dot" aria-hidden="true"><\/i>draft<\/span>/);
});

test("details rows carry version, licence, category, publisher, tags, and identifier", () => {
  const html = render({ updatedAt: "2026-08-20T12:00:00.000Z" });

  assert.match(html, /<dt>Version<\/dt><dd>1\.0\.0<\/dd>/);
  assert.match(html, /<dt>Licence<\/dt><dd>MIT<\/dd>/);
  assert.match(html, /<dt>Category<\/dt><dd>Academic<\/dd>/);
  assert.match(html, /<dt>Publisher<\/dt><dd>/);
  assert.match(html, /<dt>Tags<\/dt><dd><span class="tag">latex<\/span> <span class="tag">research<\/span><\/dd>/);
  assert.match(html, /<dt>Updated<\/dt><dd><time datetime="2026-08-20T12:00:00\.000Z">/);
  assert.match(html, /<dt>Identifier<\/dt><dd><code>latex-report<\/code><\/dd>/);
});

test("a github publisher links to the marketplace author filter", () => {
  const html = render();

  assert.match(html, /<span>by <a href="index\.html\?author=example" aria-label="Show all templates by Example Maintainer">Example Maintainer<\/a><\/span>/);
});

test("a publisher without a github repository renders as plain text", () => {
  const html = render({
    repositoryUrl: "https://gitlab.com/example/latex-report",
    repo: "https://gitlab.com/example/latex-report",
  });

  assert.match(html, /<span>by Example Maintainer<\/span>/);
  assert.doesNotMatch(html, /<a href="index\.html\?author=/);
});

test("the engagement cluster shows views and downloads for the listing", () => {
  const html = detailTemplate(templateListing(), { views: 12, downloads: 3 }, { engagementEnabled: true });

  assert.match(html, /data-engagement-metric="views"/);
  assert.match(html, /data-engagement-metric="downloads"/);
  assert.match(html, /data-plugin-engagement="example-research\.latex-report"/);

  const withoutEngagement = detailTemplate(templateListing(), {}, { engagementEnabled: false });
  assert.doesNotMatch(withoutEngagement, /detail-engagement-cluster/);
});

import {
  accentColor,
  currentHashId,
  displayTaxonomyTag,
  engagementSummary,
  escapeHtml,
  formatDate,
  loadCatalog,
  setupControlTooltips,
  setupSectionNavigation,
  setupThemeToggle,
  showToast,
  updateEngagementSummary,
} from "./shared.js";
import { recordTemplateEvent, recordTemplateViewOnce } from "./marketplace-api.js";
import { repositoryPublisher } from "./search.js";

function displayedStatus(plugin) {
  return plugin.status === "published" || !plugin.status ? "Available" : plugin.status;
}

function statusTone(plugin) {
  if (plugin.status && plugin.status !== "published") return "is-caution";
  return "";
}

function verificationBadge(plugin) {
  if (!plugin.verified) return "";
  const label = plugin.verificationMethod === "ai" ? "AI verified" : "Verified";
  return `<span class="card-verification detail-verification is-verified" aria-label="${escapeHtml(label)}">
    <span class="card-verification-trigger"><span class="card-verification-marker">${escapeHtml(label)}</span></span>
  </span>`;
}

function asideVerificationState(plugin) {
  if (plugin.verified) return { className: "is-verified", label: "Verified" };
  if (plugin.verificationStatus === "pending") return { className: "", label: "Pending" };
  return { className: "is-unverified", label: "Unverified" };
}

function publisherLink(plugin) {
  const publisher = plugin.publisher?.name || plugin.author || "";
  const login = repositoryPublisher(plugin.repositoryUrl || plugin.repo || "");
  if (!login) return escapeHtml(publisher || "Community");
  return `<a href="index.html?${new URLSearchParams({ author: login })}" aria-label="Show all templates by ${escapeHtml(publisher)}">${escapeHtml(publisher)}</a>`;
}

function setupDetailMetaLineStarts(root) {
  const meta = root.querySelector(".page-meta");
  if (!meta) return;

  const update = () => {
    let lineCenter = null;
    [...meta.children].forEach((item) => {
      item.classList.remove("is-line-start");
      if (getComputedStyle(item).display === "none") return;
      const rect = item.getBoundingClientRect();
      const center = (rect.top + rect.bottom) / 2;
      if (lineCenter === null || Math.abs(center - lineCenter) > 2) {
        item.classList.add("is-line-start");
        lineCenter = center;
      }
    });
  };
  update();
  root.ownerDocument.fonts?.ready.then(update);
  root.ownerDocument.defaultView?.addEventListener("resize", update);
}

export function setupPreviewLightbox(root, dialog) {
  const trigger = root.querySelector("[data-preview-open]");
  const previewImage = trigger?.querySelector("img");
  if (!trigger || !previewImage || !dialog) return;

  const document = root.ownerDocument;
  const openPreview = () => {
    if (dialog.open) return;

    const closeButton = document.createElement("button");
    closeButton.className = "lightbox-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close preview");
    closeButton.textContent = "×";

    const fullImage = document.createElement("img");
    fullImage.className = "lightbox-img";
    fullImage.src = trigger.dataset.fullSrc || previewImage.currentSrc || previewImage.src;
    fullImage.alt = previewImage.alt;
    fullImage.width = Number(previewImage.getAttribute("width")) || 1600;
    fullImage.height = Number(previewImage.getAttribute("height")) || 900;
    fullImage.decoding = "async";

    closeButton.addEventListener("click", () => dialog.close());
    dialog.replaceChildren(closeButton, fullImage);
    dialog.showModal();
  };

  trigger.addEventListener("click", openPreview);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialog.replaceChildren();
    trigger.focus({ preventScroll: true });
  });
}

function externalLink(url, label, className = "") {
  if (!url) return "";
  return `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
}

/**
 * Template detail markup.
 * Signature is kept stable so the page, the tests and future providers that
 * enrich a template all render through the same function.
 */
export function detailTemplate(plugin, engagement, {
  engagementEnabled = true,
  pendingEngagement = false,
} = {}) {
  const tags = (plugin.tags || [])
    .map((tag) => `<span class="tag">${escapeHtml(displayTaxonomyTag(tag))}</span>`)
    .join("");

  const preview = plugin.previewImage
    ? `<button class="detail-preview" type="button" data-preview-open data-full-src="${escapeHtml(plugin.previewImage)}" aria-label="${escapeHtml(`Open ${plugin.name} preview`)}"><img src="${escapeHtml(plugin.previewImage)}" alt="${escapeHtml(plugin.name)} template preview" width="${Number(plugin.previewWidth) || 1600}" height="${Number(plugin.previewHeight) || 900}"></button>`
    : "";

  const previewGallery = (plugin.previewImages || [])
    .filter((image) => image && image !== plugin.previewImage)
    .map((image) => `<a class="button ghost" href="${escapeHtml(image)}" target="_blank" rel="noreferrer">Preview image <span aria-hidden="true">↗</span></a>`)
    .join(" ");

  const downloadAction = plugin.downloadUrl
    ? `<a class="button primary" href="${escapeHtml(plugin.downloadUrl)}" data-download-id="${escapeHtml(plugin.id)}">Download template <span aria-hidden="true">↓</span></a>`
    : "";
  const repositoryAction = externalLink(plugin.repositoryUrl, "Repository");
  const documentationAction = externalLink(plugin.documentationUrl, "Documentation");
  const sampleAction = plugin.sampleFile && plugin.sampleFile !== plugin.downloadUrl
    ? `<a class="button ghost" href="${escapeHtml(plugin.sampleFile)}" target="_blank" rel="noreferrer">Sample file <span aria-hidden="true">↗</span></a>`
    : "";

  const downloadSection = `
    <section class="detail-section" id="download"><h2>Download</h2>
      ${downloadAction || repositoryAction
        ? `<div class="btn-row" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${downloadAction}${repositoryAction}${documentationAction}${sampleAction}</div>`
        : `<div class="placeholder-install"><strong>No download yet</strong><p>This template is listed for browsing only. Check back after the publisher adds a download link.</p></div>`}
      <p class="install-note">Downloads are served by the marketplace. Check the licence before you reuse the files.</p>
      ${previewGallery}
    </section>`;

  const detailRow = (label, value) => (value
    ? `<div class="listing-check-row"><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`
    : "");
  const detailValue = (value) => (value ? escapeHtml(String(value)) : "");

  const detailsSection = `
    <section class="detail-section" id="details"><h2>Details</h2>
      <div class="listing-checks">
        <dl>
          ${detailRow("Version", detailValue(plugin.version))}
          ${detailRow("Licence", detailValue(plugin.license))}
          ${detailRow("Category", escapeHtml(plugin.category?.name || plugin.categoryName || "Other"))}
          ${detailRow("Publisher", publisherLink(plugin))}
          ${detailRow("Tags", (plugin.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join(" ") || "")}
          ${detailRow("Updated", plugin.updatedAt ? `<time datetime="${escapeHtml(plugin.updatedAt)}">${escapeHtml(formatDate(plugin.updatedAt))}</time>` : "")}
          ${detailRow("Listed", plugin.listedAt || plugin.addedAt ? `<time datetime="${escapeHtml(plugin.listedAt || plugin.addedAt)}">${escapeHtml(formatDate(plugin.listedAt || plugin.addedAt))}</time>` : "")}
          ${detailRow("Identifier", `<code>${escapeHtml(plugin.slug || plugin.id)}</code>`)}
        </dl>
      </div>
    </section>`;

  const verified = Boolean(plugin.verified);
  const verificationNotice = verified
    ? `<li class="verification-snapshot"><strong>Verified:</strong> ${escapeHtml(plugin.verificationReason || "An administrator reviewed this listing.")}</li>`
    : `<li class="verification-unverified"><strong>Unverified:</strong> This listing has not been reviewed yet. Review the files before you use them.</li>`;
  const verificationMethod = `<li><strong>Method:</strong> ${escapeHtml(plugin.verificationMethod || "manual")}${plugin.verifiedAt ? ` · checked ${escapeHtml(formatDate(plugin.verifiedAt))}` : ""}</li>`;
  const verificationScore = typeof plugin.verificationScore === "number"
    ? `<li><strong>Score:</strong> ${Math.round(plugin.verificationScore * 100)}%</li>`
    : "";

  const verificationSection = `
    <section class="detail-section" id="verification"><h2>Verification status</h2>
      <div class="placeholder-install verification-status-note">
        <ul class="verification-status-list">${verificationNotice}${verificationMethod}${verificationScore}</ul>
      </div>
    </section>`;

  const termsSection = `
    <section class="detail-section" id="terms"><h2>Terms of Use</h2>
      <p>Templates are provided by their publishers. ${plugin.license ? `This listing is published under the <strong>${escapeHtml(plugin.license)}</strong> licence.` : "No licence is stated for this listing."}</p>
      <p>Marketplace verification is a review of the listed files and metadata. It is not a security audit or a guarantee that the template is error-free. Inspect the files before using them in submitted work.</p>
      <p style="margin-top:18px"><a class="button primary" href="submit.html">Submit a template <span aria-hidden="true">→</span></a></p>
    </section>`;

  return `
    <article class="plugin-detail-article" style="--card-accent:${accentColor(plugin.accent)}">
      <header class="page-header" id="overview"><div class="page-eyebrow">${escapeHtml(plugin.category?.name || plugin.categoryName || "Template")}</div>
        <div class="detail-title"><span class="detail-icon">${escapeHtml(plugin.initials || "TM")}</span><h1>${escapeHtml(plugin.name)}</h1></div>
        <div class="page-meta"><span>${escapeHtml(plugin.slug || plugin.id)}</span><span>v${escapeHtml(plugin.version || "1.0.0")}</span><span>by ${publisherLink(plugin)}</span><span class="detail-status-meta"><span class="status ${statusTone(plugin)}"><i class="status-dot" aria-hidden="true"></i>${escapeHtml(displayedStatus(plugin))}</span>${verificationBadge(plugin)}</span></div>
        ${engagementEnabled ? `<div class="detail-engagement-cluster${pendingEngagement ? " is-pending" : ""}">
          ${engagementSummary(plugin, engagement, { detail: true, pending: pendingEngagement })}
        </div>` : ""}
      </header>
      <p class="detail-description">${escapeHtml(plugin.description)}</p>${preview}<div class="plugin-tags">${tags}</div>
      ${downloadSection}
      ${detailsSection}
      ${verificationSection}
      ${termsSection}
    </article>`;
}

function showDetailError({ title, message, crumb }) {
  const content = document.querySelector("#detail-content");
  const error = document.querySelector("#detail-error");
  content.hidden = true;
  error.hidden = false;
  error.querySelector("h1").textContent = title;
  error.querySelector("p").textContent = message;
  document.querySelector("#crumb-name").textContent = crumb;
  document.title = `${title} | Template Marketplace`;
}

async function init() {
  setupThemeToggle();
  const id = new URLSearchParams(location.search).get("id");
  const content = document.querySelector("#detail-content");
  let catalog;

  try {
    catalog = await loadCatalog();
  } catch (reason) {
    console.error(reason);
    showDetailError({
      title: "Catalog unavailable",
      message: "The template catalog could not be loaded. Try again in a moment.",
      crumb: "Unavailable",
    });
    return;
  }

  if (!catalog || !Array.isArray(catalog.templates)) {
    showDetailError({
      title: "Catalog unavailable",
      message: "The template catalog could not be loaded. Try again in a moment.",
      crumb: "Unavailable",
    });
    return;
  }

  const plugin = catalog.templates.find((item) => item?.id === id || item?.slug === id);
  if (!plugin) {
    showDetailError({
      title: "Template not found",
      message: "This template does not exist in the current catalog.",
      crumb: "Not found",
    });
    return;
  }

  try {
    document.title = `${plugin.name} | Template Marketplace`;
    document.querySelector("#crumb-name").textContent = plugin.name;
    content.className = "";
    let stats = { views: Number(plugin.views || 0), downloads: Number(plugin.downloads || 0) };

    content.innerHTML = detailTemplate(plugin, stats, {
      engagementEnabled: true,
      pendingEngagement: false,
    });
    setupControlTooltips(content);
    setupDetailMetaLineStarts(content);
    setupPreviewLightbox(content, document.querySelector("#preview-lightbox"));
    document.querySelector("#aside-verification-link").hidden = !content.querySelector("#verification");
    document.querySelector("#aside-security-link").hidden = true;
    if (currentHashId() === "trust") {
      const url = new URL(location.href);
      url.hash = "terms";
      history.replaceState(history.state, "", url);
    }
    setupSectionNavigation({
      sectionSelector: "#detail-content .plugin-detail-article > [id]",
      linkSelector: ".right-aside .aside-link[href^='#'], .mobile-bottom a[href^='#']",
    });

    document.querySelector("#aside-status").innerHTML = `<span class="status-label ${statusTone(plugin)}">${escapeHtml(displayedStatus(plugin))}</span>`;
    const verification = asideVerificationState(plugin);
    const verificationRow = document.querySelector("#aside-verification-row");
    verificationRow.hidden = false;
    document.querySelector("#aside-verification").innerHTML =
      `<span class="aside-verification ${verification.className}"><span class="aside-verification-marker status-label ${verification.className}">${escapeHtml(verification.label)}</span></span>`;
    document.querySelector("#aside-version").textContent = plugin.version || "—";
    document.querySelector("#aside-license").textContent = plugin.license || "Unknown";
    document.querySelector("#aside-owner").innerHTML = publisherLink(plugin);

    // Anonymous counters: one view per session, plus one per download click.
    recordTemplateViewOnce(plugin.id).then((result) => {
      if (!result?.ok) return;
      stats = { views: stats.views + 1, downloads: stats.downloads };
      updateEngagementSummary(document, plugin.id, stats);
    });

    content.querySelectorAll("[data-download-id]").forEach((link) => {
      link.addEventListener("click", async () => {
        const result = await recordTemplateEvent(plugin.id, "download");
        if (result?.ok) {
          stats = { views: stats.views, downloads: stats.downloads + 1 };
          updateEngagementSummary(document, plugin.id, stats);
          showToast("Download started");
        }
      }, { once: true });
    });
  } catch (reason) {
    console.error(reason);
    showDetailError({
      title: "Template details unavailable",
      message: "The template details could not be displayed. Return to the marketplace and try again.",
      crumb: "Unavailable",
    });
  }
}

if (typeof document !== "undefined") init();

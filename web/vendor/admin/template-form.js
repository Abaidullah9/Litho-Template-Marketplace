import {
  api,
  confirmAction,
  del,
  escapeHtml,
  fmtDateTime,
  get,
  mountAdmin,
  post,
  put,
  requireSession,
  showFormErrors,
  statusBadge,
  toast,
} from "./admin.js";

const params = new URLSearchParams(window.location.search);
const templateId = params.get("id") || "";
const isNew = !templateId;

const shell = mountAdmin({
  active: isNew ? "template-new" : "templates",
  title: isNew ? "New template" : "Edit template",
  crumb: "Admin / Marketplace / Editor",
  actions: `
    <a class="btn ghost" href="/admin/templates">← Back</a>
    ${isNew ? "" : '<button class="btn danger" type="button" data-action="delete">Delete</button>'}
  `,
});

await requireSession();

shell.body.innerHTML = `
  <div id="form-notice"></div>
  <form id="template-form" novalidate>
    <section class="panel">
      <div class="panel-head"><h2>Identity</h2><span id="record-meta" class="field-hint"></span></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="name">Template name *</label>
            <input type="text" id="name" name="name" maxlength="160" required placeholder="IEEE Conference Paper">
            <span class="field-error" data-error-for="name"></span>
          </div>
          <div class="field">
            <label for="slug">Slug *</label>
            <input type="text" id="slug" name="slug" maxlength="80" placeholder="ieee-conference-paper">
            <span class="field-hint">Leave empty to derive it from the name.</span>
            <span class="field-error" data-error-for="slug"></span>
          </div>
          <div class="field full">
            <label for="description">Short description *</label>
            <textarea id="description" name="description" rows="3" maxlength="600" placeholder="One or two sentences shown on cards and in search results."></textarea>
            <span class="field-error" data-error-for="description"></span>
          </div>
          <div class="field full">
            <label for="longDescription">Full description</label>
            <textarea id="longDescription" name="longDescription" class="tall" rows="12" placeholder="Everything a visitor should know: structure, contents, requirements, licence notes."></textarea>
            <span class="field-error" data-error-for="longDescription"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Taxonomy</h2></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="categoryId">Category</label>
            <select id="categoryId" name="categoryId"><option value="">Uncategorised</option></select>
            <span class="field-error" data-error-for="categoryId"></span>
          </div>
          <div class="field">
            <label for="publisherId">Publisher</label>
            <select id="publisherId" name="publisherId"><option value="">No publisher</option></select>
            <span class="field-error" data-error-for="publisherId"></span>
          </div>
          <div class="field full">
            <label for="tags">Tags</label>
            <input type="text" id="tags" name="tags" placeholder="LaTeX, Research, University">
            <span class="field-hint">Comma separated. New tags are created automatically.</span>
            <span class="field-error" data-error-for="tags"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Links and files</h2></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="version">Version</label>
            <input type="text" id="version" name="version" placeholder="1.0.0">
            <span class="field-error" data-error-for="version"></span>
          </div>
          <div class="field">
            <label for="license">Licence</label>
            <input type="text" id="license" name="license" placeholder="MIT">
            <span class="field-error" data-error-for="license"></span>
          </div>
          <div class="field">
            <label for="downloadUrl">Download URL</label>
            <input type="url" id="downloadUrl" name="downloadUrl" placeholder="/assets/templates/ieee.tex or https://…">
            <span class="field-error" data-error-for="downloadUrl"></span>
          </div>
          <div class="field">
            <label for="repositoryUrl">Repository URL</label>
            <input type="url" id="repositoryUrl" name="repositoryUrl" placeholder="https://github.com/…">
            <span class="field-error" data-error-for="repositoryUrl"></span>
          </div>
          <div class="field">
            <label for="documentationUrl">Documentation URL</label>
            <input type="url" id="documentationUrl" name="documentationUrl" placeholder="https://…">
            <span class="field-error" data-error-for="documentationUrl"></span>
          </div>
          <div class="field">
            <label for="previewImageUrl">Preview image URL</label>
            <input type="url" id="previewImageUrl" name="previewImage" placeholder="/assets/img/templates/…">
            <span class="field-error" data-error-for="previewImage"></span>
          </div>
          <div class="field">
            <label for="previewImage">Upload preview image</label>
            <input type="file" id="previewImage" name="previewImageFile" accept="image/*">
            <span class="field-hint">PNG, JPG, WebP or AVIF · max 15 MB. Replaces the URL.</span>
          </div>
          <div class="field">
            <label for="previewImages">Additional images</label>
            <input type="text" id="previewImages" name="previewImages" placeholder="/assets/img/…, /assets/img/…">
            <span class="field-error" data-error-for="previewImages"></span>
          </div>
          <div class="field">
            <label for="sampleFileUrl">Sample file URL</label>
            <input type="url" id="sampleFileUrl" name="sampleFile" placeholder="/assets/templates/…">
            <span class="field-error" data-error-for="sampleFile"></span>
          </div>
          <div class="field">
            <label for="sampleFile">Upload sample file</label>
            <input type="file" id="sampleFile" name="sampleFileFile" accept=".pdf,.zip,.txt,.tex,.md,application/pdf,application/zip">
            <span class="field-hint">PDF, ZIP or TXT · max 15 MB.</span>
          </div>
          <div class="field full">
            <div id="preview-thumb" style="margin-top:4px"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Publishing</h2></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="status">Status *</label>
            <select id="status" name="status">
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
            <span class="field-hint">Only published templates appear in the marketplace and registry.</span>
            <span class="field-error" data-error-for="status"></span>
          </div>
          <div class="field">
            <label>Placement</label>
            <label class="checkbox-field" style="min-height:34px"><input type="checkbox" id="featured" name="featured"> Featured on the homepage</label>
            <span class="field-error" data-error-for="featured"></span>
          </div>
          <div class="field">
            <label>Verification</label>
            <div id="verification-state" class="field-hint">—</div>
            <div class="btn-row" style="margin-top:8px">
              <button class="btn small" type="button" data-action="verify">Verify</button>
              <button class="btn ghost small" type="button" data-action="unverify">Remove verification</button>
            </div>
          </div>
        </div>
        <div class="form-actions" style="margin-top:16px">
          <button class="btn primary" type="submit">${isNew ? "Create template" : "Save changes"}</button>
          ${isNew ? "" : '<button class="btn" type="button" data-action="publish">Save & publish</button>'}
          <a class="btn ghost" href="/admin/templates">Cancel</a>
        </div>
      </div>
    </section>
  </form>
`;

const form = document.getElementById("template-form");
let record = null;
let slugTouched = false;

// ---------------------------------------------------------------- load
const [categories, publishers] = await Promise.all([
  get("/api/admin/categories").catch(() => []),
  get("/api/admin/publishers").catch(() => []),
]);

const categorySelect = document.getElementById("categoryId");
categorySelect.insertAdjacentHTML("beforeend", categories.map((row) => (
  `<option value="${escapeHtml(row.id)}">${escapeHtml(row.name)}${row.templateCount !== undefined ? ` (${row.templateCount})` : ""}</option>`
)).join(""));

const publisherSelect = document.getElementById("publisherId");
publisherSelect.insertAdjacentHTML("beforeend", publishers.map((row) => (
  `<option value="${escapeHtml(row.id)}">${escapeHtml(row.name)}</option>`
)).join(""));

if (!isNew) {
  try {
    record = await get(`/api/admin/templates/${encodeURIComponent(templateId)}`);
  } catch (error) {
    document.getElementById("form-notice").innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

if (record) {
  form.name.value = record.name || "";
  form.slug.value = record.slug || "";
  form.description.value = record.description || "";
  form.longDescription.value = record.long_description || "";
  form.categoryId.value = record.category_id || "";
  form.publisherId.value = record.publisher_id || "";
  form.version.value = record.version || "1.0.0";
  form.license.value = record.license || "";
  form.downloadUrl.value = record.download_url || "";
  form.repositoryUrl.value = record.repository_url || "";
  form.documentationUrl.value = record.documentation_url || "";
  form.previewImage.value = record.preview_image || "";
  form.previewImages.value = (record.preview_images || []).join(", ");
  form.sampleFile.value = record.sample_file || "";
  form.status.value = record.status || "draft";
  form.featured.checked = Boolean(record.featured);
  slugTouched = true;
  document.getElementById("record-meta").textContent = `created ${fmtDateTime(record.created_at)} · updated ${fmtDateTime(record.updated_at)} · ${record.views} views / ${record.downloads} downloads`;
  renderVerification();
  renderPreview();
} else {
  document.getElementById("record-meta").textContent = "new record";
  renderVerification();
}

function renderVerification() {
  const host = document.getElementById("verification-state");
  if (!record) {
    host.textContent = "Available after the template is created.";
    return;
  }
  host.innerHTML = `
    <span class="badge ${record.verified ? "verified" : ""}">${record.verified ? "verified" : "unverified"}</span>
    <div style="margin-top:6px">method: ${escapeHtml(record.verification_method || "manual")}<br>
    ${escapeHtml(record.verification_reason || "no reason recorded")}</div>
  `;
}

function renderPreview() {
  const value = form.previewImage.value;
  const host = document.getElementById("preview-thumb");
  host.innerHTML = value
    ? `<img src="${escapeHtml(value)}" alt="Preview" style="width:min(420px,100%);border:1px solid var(--line);display:block">`
    : "";
}

form.previewImage.addEventListener("change", renderPreview);

form.name.addEventListener("input", () => {
  if (slugTouched || !isNew) return;
  form.slug.value = form.name.value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^[.-]+|[.-]+$/g, "").slice(0, 80);
});
form.slug.addEventListener("input", () => { slugTouched = true; });

// ---------------------------------------------------------------- actions
function collectBody() {
  return {
    name: form.name.value.trim(),
    slug: form.slug.value.trim(),
    description: form.description.value.trim(),
    longDescription: form.longDescription.value.trim(),
    categoryId: form.categoryId.value || null,
    publisherId: form.publisherId.value || null,
    tags: form.tags.value,
    version: form.version.value.trim(),
    license: form.license.value.trim(),
    downloadUrl: form.downloadUrl.value.trim(),
    repositoryUrl: form.repositoryUrl.value.trim(),
    documentationUrl: form.documentationUrl.value.trim(),
    previewImage: form.previewImage.value.trim(),
    previewImages: form.previewImages.value,
    sampleFile: form.sampleFile.value.trim(),
    status: form.status.value,
    featured: form.featured.checked,
  };
}

function collectForm() {
  const body = collectBody();
  const previewFile = form.previewImageFile.files[0];
  const sampleFile = form.sampleFileFile.files[0];
  if (!previewFile && !sampleFile) return { body };

  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    formData.set(key, value === null || value === undefined ? "" : String(value));
  }
  if (previewFile) formData.set("previewImage", previewFile);
  if (sampleFile) formData.set("sampleFile", sampleFile);
  return { formData };
}

async function save({ publish = false } = {}) {
  showFormErrors(form);
  const payload = collectBody();
  if (publish) payload.status = "published";
  const { formData } = collectForm();

  try {
    const saved = isNew
      ? await api("/api/admin/templates", { method: "POST", body: payload, ...(formData ? { formData } : {}) })
      : await api(`/api/admin/templates/${encodeURIComponent(templateId)}`, { method: "PUT", body: payload, ...(formData ? { formData } : {}) });
    toast(isNew ? "Template created" : "Template saved", "success");
    window.location.href = `/admin/templates/new?id=${encodeURIComponent(saved.id || templateId)}`;
  } catch (error) {
    showFormErrors(form, error.details || {});
    toast(error.message, "error");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  save();
});

shell.actions.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  if (action === "publish") await save({ publish: true });

  if (action === "verify" || action === "unverify") {
    if (!record) return toast("Save the template first.", "error");
    try {
      record = await post(`/api/admin/templates/${encodeURIComponent(record.id)}/${action}`, {});
      renderVerification();
      toast(action === "verify" ? "Template verified" : "Verification removed", "success");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  if (action === "delete") {
    if (!record) return;
    const ok = await confirmAction("Delete this template permanently? This cannot be undone.", { confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await del(`/api/admin/templates/${encodeURIComponent(record.id)}`);
      toast("Template deleted", "success");
      window.location.href = "/admin/templates";
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

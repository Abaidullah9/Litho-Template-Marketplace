/**
 * Public template submission form (/submit).
 *
 * Loads the public taxonomy into the selects, then posts the form as
 * multipart/form-data to POST /api/submissions. Field errors come back as an
 * `error.details` map (field → message) and are rendered inline; uploads are
 * optional and posted under the field names the API expects.
 */

import { api, escapeHtml, fillSelect, showFormErrors, toast } from "./admin/admin.js";

const form = document.getElementById("submit-form");
const result = document.getElementById("submit-result");
const submitButton = document.getElementById("submit-button");

if (form) {
  init().catch((error) => {
    toast(error.message, "error");
  });
}

async function init() {
  await loadTaxonomy();
  form.addEventListener("submit", onSubmit);
}

/** Populate the category/publisher selects from the public API. */
async function loadTaxonomy() {
  const [categories, publishers] = await Promise.all([
    api("/api/categories"),
    api("/api/publishers"),
  ]);

  fillSelect(form.categoryId, categories || [], { placeholder: "Choose a category" });
  fillSelect(form.publisherId, publishers || [], { placeholder: "Select an existing publisher" });

  // Choosing an existing publisher makes the "new publisher name" field moot.
  form.publisherId.addEventListener("change", () => {
    if (form.publisherId.value) form.publisherName.value = "";
  });
  form.publisherName.addEventListener("input", () => {
    if (form.publisherName.value.trim()) form.publisherId.value = "";
  });
}

/** Build the multipart body: text fields plus optional file uploads. */
function buildFormData() {
  const data = new FormData();
  for (const element of form.elements) {
    if (!element.name || element.type === "file") continue;
    const value = typeof element.value === "string" ? element.value.trim() : element.value;
    if (value === "" || value === null || value === undefined) continue;
    data.append(element.name, value);
  }
  // The API expects the files under these names; the inputs are suffixed in
  // the markup so they never collide with the URL fields of the same name.
  const preview = form.previewImageFile?.files?.[0];
  const sample = form.sampleFileFile?.files?.[0];
  if (preview) data.append("previewImage", preview);
  if (sample) data.append("sampleFile", sample);
  return data;
}

/** Light required checks so obvious mistakes never round-trip. */
const field = (name) => form.elements.namedItem(name);

function validateLocally() {
  const errors = {};
  if ((field("name")?.value || "").trim().length < 2) errors.name = "Template name is required.";
  if ((field("description")?.value || "").trim().length < 10) {
    errors.description = "Please write at least 10 characters.";
  }
  if (!field("downloadUrl")?.value.trim() && !field("repositoryUrl")?.value.trim()) {
    errors.downloadUrl = "Add a download URL or a repository URL.";
  }
  showFormErrors(form, errors);
  const firstInvalid = form.querySelector("[aria-invalid]");
  if (firstInvalid) firstInvalid.focus();
  return Object.keys(errors).length === 0;
}

async function onSubmit(event) {
  event.preventDefault();
  showFormErrors(form, {});
  result.innerHTML = "";
  if (!validateLocally()) return;

  submitButton.disabled = true;
  const originalLabel = submitButton.textContent;
  submitButton.textContent = "Sending…";

  try {
    const response = await api("/api/submissions", { method: "POST", formData: buildFormData() });
    renderSuccess(response);
  } catch (error) {
    if (error.details) {
      showFormErrors(form, error.details);
      const firstInvalid = form.querySelector("[aria-invalid]");
      if (firstInvalid) firstInvalid.focus();
    }
    toast(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
}

function renderSuccess(response) {
  form.hidden = true;
  result.innerHTML = `
    <div class="notice success" style="border-color:#69d4a7;color:#69d4a7">
      <strong>${escapeHtml(response?.message || "Thanks! Your template was received and is now pending review.")}</strong>
      <p style="margin:8px 0 0;font-size:13px;line-height:1.7;color:var(--muted)">
        ${escapeHtml(response?.name || "Your submission")} was recorded as
        <em>pending</em>${response?.id ? ` (reference <code>${escapeHtml(response.id)}</code>)` : ""}.
        An administrator will review it before anything appears publicly, and a
        rejection always comes with a reason.
      </p>
    </div>
    <div class="form-actions" style="margin-top:16px">
      <a class="btn primary" href="index.html">Browse the marketplace →</a>
      <button class="btn ghost" type="button" data-another>Submit another template</button>
    </div>
  `;
  toast("Submission received.", "success");
  result.querySelector("[data-another]").addEventListener("click", () => {
    form.reset();
    showFormErrors(form, {});
    form.hidden = false;
    result.innerHTML = "";
    field("name")?.focus();
  });
}

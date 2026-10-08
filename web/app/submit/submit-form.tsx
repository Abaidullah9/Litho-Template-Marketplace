"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { showAdminToast } from "@/lib/admin-toast";

type TaxonomyItem = { slug: string; name: string; templateCount?: number };

type SuccessInfo = { message: string; name: string; id?: string };

type NamedElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const DEFAULT_MESSAGE = "Thanks! Your template was received and is now pending review.";

const fieldOf = (form: HTMLFormElement, name: string) => form.elements.namedItem(name) as NamedElement | null;

/** Port of submit.js `buildFormData`: trimmed text fields plus the two optional uploads. */
function buildFormData(form: HTMLFormElement) {
  const data = new FormData();
  for (const element of Array.from(form.elements) as NamedElement[]) {
    if (!element.name || element.type === "file") continue;
    const value = typeof element.value === "string" ? element.value.trim() : element.value;
    if (value === "" || value === null || value === undefined) continue;
    data.append(element.name, value);
  }
  // The API expects the files under these names; the inputs are suffixed in the markup so they
  // never collide with the URL fields of the same name.
  const preview = (fieldOf(form, "previewImageFile") as HTMLInputElement | null)?.files?.[0];
  const sample = (fieldOf(form, "sampleFileFile") as HTMLInputElement | null)?.files?.[0];
  if (preview) data.append("previewImage", preview);
  if (sample) data.append("sampleFile", sample);
  return data;
}

/** Light required checks so obvious mistakes never round-trip. */
function validateLocally(form: HTMLFormElement) {
  const errors: Record<string, string> = {};
  if ((fieldOf(form, "name")?.value || "").trim().length < 2) errors.name = "Template name is required.";
  if ((fieldOf(form, "description")?.value || "").trim().length < 10) {
    errors.description = "Please write at least 10 characters.";
  }
  if (!fieldOf(form, "downloadUrl")?.value.trim() && !fieldOf(form, "repositoryUrl")?.value.trim()) {
    errors.downloadUrl = "Add a download URL or a repository URL.";
  }
  return errors;
}

/** Legacy focuses the first `[aria-invalid]` in DOM order; walk the form the same way. */
function focusFirstError(form: HTMLFormElement, errors: Record<string, string>) {
  for (const element of Array.from(form.elements) as NamedElement[]) {
    if (element.name && errors[element.name]) {
      element.focus();
      return;
    }
  }
}

export function SubmitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const publisherSelectRef = useRef<HTMLSelectElement>(null);
  const publisherNameRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [publishers, setPublishers] = useState<TaxonomyItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  /** Set by "Submit another template"; the field cannot take focus until the grid is shown again. */
  const focusNameAfterReset = useRef(false);

  useEffect(() => {
    if (success !== null || !focusNameAfterReset.current) return;
    focusNameAfterReset.current = false;
    if (formRef.current) fieldOf(formRef.current, "name")?.focus();
  }, [success]);

  // The selects start with just their placeholder option, then fill from the public API exactly
  // like `loadTaxonomy()` did.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedCategories, loadedPublishers] = await Promise.all([
          api<TaxonomyItem[]>("/api/categories"),
          api<TaxonomyItem[]>("/api/publishers"),
        ]);
        if (cancelled) return;
        setCategories(loadedCategories || []);
        setPublishers(loadedPublishers || []);
      } catch (error) {
        if (!cancelled) showAdminToast((error as Error).message, "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Choosing an existing publisher makes the "new publisher name" field moot, and vice versa. */
  function syncPublisherFields(source: "select" | "name") {
    const select = publisherSelectRef.current;
    const name = publisherNameRef.current;
    if (!select || !name) return;
    if (source === "select" && select.value) name.value = "";
    if (source === "name" && name.value.trim()) select.value = "";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;
    setErrors({});
    setSuccess(null);

    const localErrors = validateLocally(form);
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      focusFirstError(form, localErrors);
      return;
    }

    setSending(true);
    try {
      const response = await api<{ message?: string; name?: string; id?: string }>("/api/submissions", {
        method: "POST",
        formData: buildFormData(form),
      });
      setSuccess({
        message: response?.message || DEFAULT_MESSAGE,
        name: response?.name || "Your submission",
        id: response?.id,
      });
      showAdminToast("Submission received.", "success");
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.details) {
        setErrors(apiError.details);
        focusFirstError(form, apiError.details);
      }
      showAdminToast(apiError.message, "error");
    } finally {
      setSending(false);
    }
  }

  function resetForAnother() {
    const form = formRef.current;
    if (!form) return;
    form.reset();
    setErrors({});
    focusNameAfterReset.current = true;
    setSuccess(null);
  }

  return (
    <form id="submit-form" ref={formRef} noValidate onSubmit={onSubmit}>
      {/* The hand-written page hid the whole form on success, which also hid the notice it had
          just written into #submit-result; only the fields retire here so the notice is visible. */}
      <div className="form-grid" hidden={success !== null}>
        <div className="field">
          <label htmlFor="name">Template name *</label>
          <input
            type="text"
            id="name"
            name="name"
            maxLength={160}
            required
            placeholder="IEEE Conference Paper"
            aria-invalid={errors.name ? "true" : undefined}
          />
          <span className="field-error" data-error-for="name">
            {errors.name}
          </span>
        </div>
        <div className="field">
          <label htmlFor="version">Version</label>
          <input type="text" id="version" name="version" placeholder="1.0.0" aria-invalid={errors.version ? "true" : undefined} />
          <span className="field-error" data-error-for="version">
            {errors.version}
          </span>
        </div>
        <div className="field full">
          <label htmlFor="description">Short description *</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={600}
            required
            placeholder="One or two sentences shown on the card."
            aria-invalid={errors.description ? "true" : undefined}
          />
          <span className="field-error" data-error-for="description">
            {errors.description}
          </span>
        </div>
        <div className="field full">
          <label htmlFor="longDescription">Full description</label>
          <textarea
            id="longDescription"
            name="longDescription"
            className="tall"
            rows={8}
            placeholder="Structure, contents, requirements, who it is for."
            aria-invalid={errors.longDescription ? "true" : undefined}
          />
          <span className="field-error" data-error-for="longDescription">
            {errors.longDescription}
          </span>
        </div>

        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" aria-invalid={errors.categoryId ? "true" : undefined}>
            <option value="">Choose a category</option>
            {categories.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
                {item.templateCount !== undefined ? ` (${item.templateCount})` : ""}
              </option>
            ))}
          </select>
          <span className="field-error" data-error-for="categoryId">
            {errors.categoryId}
          </span>
        </div>
        <div className="field">
          <label htmlFor="publisherId">Publisher</label>
          <select
            id="publisherId"
            name="publisherId"
            ref={publisherSelectRef}
            onChange={() => syncPublisherFields("select")}
            aria-invalid={errors.publisherId ? "true" : undefined}
          >
            <option value="">Select an existing publisher</option>
            {publishers.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
                {item.templateCount !== undefined ? ` (${item.templateCount})` : ""}
              </option>
            ))}
          </select>
          <span className="field-hint">Or name a new publisher below.</span>
          <span className="field-error" data-error-for="publisherId">
            {errors.publisherId}
          </span>
        </div>
        <div className="field">
          <label htmlFor="publisherName">Publisher name</label>
          <input
            type="text"
            id="publisherName"
            name="publisherName"
            maxLength={120}
            placeholder="Your name or team"
            ref={publisherNameRef}
            onInput={() => syncPublisherFields("name")}
            aria-invalid={errors.publisherName ? "true" : undefined}
          />
          <span className="field-error" data-error-for="publisherName">
            {errors.publisherName}
          </span>
        </div>
        <div className="field">
          <label htmlFor="tags">Tags</label>
          <input type="text" id="tags" name="tags" placeholder="LaTeX, Research, University" aria-invalid={errors.tags ? "true" : undefined} />
          <span className="field-hint">Comma separated, up to 10.</span>
          <span className="field-error" data-error-for="tags">
            {errors.tags}
          </span>
        </div>

        <div className="field">
          <label htmlFor="license">Licence</label>
          <input type="text" id="license" name="license" placeholder="MIT" aria-invalid={errors.license ? "true" : undefined} />
          <span className="field-error" data-error-for="license">
            {errors.license}
          </span>
        </div>
        <div className="field">
          <label htmlFor="downloadUrl">Download URL *</label>
          <input
            type="url"
            id="downloadUrl"
            name="downloadUrl"
            required
            placeholder="https://… or /assets/…"
            aria-invalid={errors.downloadUrl ? "true" : undefined}
          />
          <span className="field-hint">Add this or a repository URL.</span>
          <span className="field-error" data-error-for="downloadUrl">
            {errors.downloadUrl}
          </span>
        </div>
        <div className="field">
          <label htmlFor="repositoryUrl">Repository URL</label>
          <input
            type="url"
            id="repositoryUrl"
            name="repositoryUrl"
            placeholder="https://github.com/…"
            aria-invalid={errors.repositoryUrl ? "true" : undefined}
          />
          <span className="field-error" data-error-for="repositoryUrl">
            {errors.repositoryUrl}
          </span>
        </div>
        <div className="field">
          <label htmlFor="documentationUrl">Documentation URL</label>
          <input
            type="url"
            id="documentationUrl"
            name="documentationUrl"
            placeholder="https://…"
            aria-invalid={errors.documentationUrl ? "true" : undefined}
          />
          <span className="field-error" data-error-for="documentationUrl">
            {errors.documentationUrl}
          </span>
        </div>

        <div className="field">
          <label htmlFor="previewImage">Preview image URL</label>
          <input
            type="url"
            id="previewImage"
            name="previewImage"
            placeholder="https://… first page screenshot"
            aria-invalid={errors.previewImage ? "true" : undefined}
          />
          <span className="field-error" data-error-for="previewImage">
            {errors.previewImage}
          </span>
        </div>
        <div className="field">
          <label htmlFor="previewUpload">Upload preview image</label>
          <input type="file" id="previewUpload" name="previewImageFile" accept="image/*" />
          <span className="field-hint">PNG, JPG, WebP · max 15 MB.</span>
        </div>
        <div className="field">
          <label htmlFor="previewImages">Additional images</label>
          <input
            type="text"
            id="previewImages"
            name="previewImages"
            placeholder="https://…, https://…"
            aria-invalid={errors.previewImages ? "true" : undefined}
          />
          <span className="field-error" data-error-for="previewImages">
            {errors.previewImages}
          </span>
        </div>
        <div className="field">
          <label htmlFor="sampleFile">Sample file URL</label>
          <input
            type="url"
            id="sampleFile"
            name="sampleFile"
            placeholder="https://… example output"
            aria-invalid={errors.sampleFile ? "true" : undefined}
          />
          <span className="field-error" data-error-for="sampleFile">
            {errors.sampleFile}
          </span>
        </div>
        <div className="field">
          <label htmlFor="sampleUpload">Upload sample file</label>
          <input
            type="file"
            id="sampleUpload"
            name="sampleFileFile"
            accept=".pdf,.zip,.txt,.md,.tex,application/pdf,application/zip"
          />
          <span className="field-hint">PDF, ZIP or TXT · max 15 MB.</span>
        </div>

        <div className="field">
          <label htmlFor="submitterName">Your name</label>
          <input
            type="text"
            id="submitterName"
            name="submitterName"
            maxLength={120}
            placeholder="Optional"
            aria-invalid={errors.submitterName ? "true" : undefined}
          />
          <span className="field-error" data-error-for="submitterName">
            {errors.submitterName}
          </span>
        </div>
        <div className="field">
          <label htmlFor="submitterEmail">Your email</label>
          <input
            type="email"
            id="submitterEmail"
            name="submitterEmail"
            placeholder="Optional — only used to reach you about this submission"
            aria-invalid={errors.submitterEmail ? "true" : undefined}
          />
          <span className="field-error" data-error-for="submitterEmail">
            {errors.submitterEmail}
          </span>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: 18 }} hidden={success !== null}>
        <button className="btn primary" type="submit" id="submit-button" disabled={sending}>
          {sending ? "Sending…" : "Submit for review →"}
        </button>
        <a className="btn ghost" href="/index.html">
          Cancel
        </a>
      </div>

      <div id="submit-result" style={{ marginTop: 16 }}>
        {success ? (
          <>
            <div className="notice success" style={{ borderColor: "#69d4a7", color: "#69d4a7" }}>
              <strong>{success.message}</strong>
              <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.7, color: "var(--muted)" }}>
                {success.name} was recorded as <em>pending</em>
                {success.id ? (
                  <>
                    {" "}
                    (reference <code>{success.id}</code>)
                  </>
                ) : null}
                . An administrator will review it before anything appears publicly, and a rejection always comes with a
                reason.
              </p>
            </div>
            <div className="form-actions" style={{ marginTop: 16 }}>
              <a className="btn primary" href="/index.html">
                Browse the marketplace →
              </a>
              <button className="btn ghost" type="button" onClick={resetForAnother}>
                Submit another template
              </button>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}

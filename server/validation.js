import { badRequest } from "./errors.js";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const VERSION_PATTERN = /^[0-9A-Za-z][0-9A-Za-z.+-]{0,31}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEMPLATE_STATUSES = ["draft", "pending", "published", "rejected", "archived"];
const SUBMISSION_STATUSES = ["pending", "approved", "rejected"];

/** Mirrors the SQL slugify() so slugs satisfy the database check constraint. */
export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^[.-]+/, "")
    .replace(/[.-]+$/, "")
    .slice(0, 80);
}

export function isValidSlug(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 80 && SLUG_PATTERN.test(value);
}

/** Accepts http(s) URLs and root-relative paths (uploaded files). */
export function isValidUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

/**
 * Small accumulator validator: collect per-field errors, then throw one 400
 * with a `fields` map so the UI can highlight exactly what is wrong.
 */
export function createValidator() {
  const errors = {};
  const fail = (field, message) => {
    if (!errors[field]) errors[field] = message;
  };

  const api = {
    errors,
    get ok() {
      return Object.keys(errors).length === 0;
    },
    text(input, field, { required = false, min = 0, max = 4000, label = field, value } = {}) {
      const text = cleanString(value ?? input?.[field]);
      if (!text) {
        if (required) fail(field, `${label} is required.`);
        return "";
      }
      if (text.length < min) fail(field, `${label} must be at least ${min} characters.`);
      if (text.length > max) fail(field, `${label} must be at most ${max} characters.`);
      return text;
    },
    url(input, field, { required = false, label = field, value } = {}) {
      const text = cleanString(value ?? input?.[field]);
      if (!text) {
        if (required) fail(field, `${label} is required.`);
        return "";
      }
      if (!isValidUrl(text)) fail(field, `${label} must be a valid http(s) URL.`);
      return text;
    },
    slug(input, field, { required = false, label = field, auto = true, value } = {}) {
      const raw = cleanString(value ?? input?.[field]);
      if (!raw) {
        if (required) fail(field, `${label} is required.`);
        return "";
      }
      const slug = auto ? slugify(raw) : raw;
      if (!isValidSlug(slug)) fail(field, `${label} must be a URL-safe slug (letters, numbers, dots, dashes).`);
      return slug;
    },
    enum(input, field, allowed, { required = false, label = field } = {}) {
      const text = cleanString(input?.[field]);
      if (!text) {
        if (required) fail(field, `${label} is required.`);
        return "";
      }
      if (!allowed.includes(text)) fail(field, `${label} must be one of: ${allowed.join(", ")}.`);
      return text;
    },
    bool(input, field, fallback = false) {
      const value = input?.[field];
      if (value === undefined || value === null || value === "") return fallback;
      if (typeof value === "boolean") return value;
      if (value === "true" || value === "on" || value === 1 || value === "1") return true;
      if (value === "false" || value === "0" || value === 0) return false;
      fail(field, `${field} must be true or false.`);
      return fallback;
    },
    stringArray(input, field, { maxItems = 20, maxItemLength = 60 } = {}) {
      const raw = input?.[field];
      const list = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(",").map((item) => item.trim()).filter(Boolean)
          : [];
      const values = [];
      for (const item of list) {
        const text = cleanString(item);
        if (!text) continue;
        if (text.length > maxItemLength) {
          fail(field, `Each ${field} entry must be at most ${maxItemLength} characters.`);
          break;
        }
        values.push(text);
      }
      if (values.length > maxItems) {
        fail(field, `At most ${maxItems} ${field} entries are allowed.`);
        return [];
      }
      return [...new Set(values)];
    },
    email(input, field, { required = false, label = field } = {}) {
      const text = cleanString(input?.[field]);
      if (!text) {
        if (required) fail(field, `${label} is required.`);
        return "";
      }
      if (!EMAIL_PATTERN.test(text)) fail(field, `${label} must be a valid email address.`);
      return text;
    },
    version(input, field, { required = false, label = field } = {}) {
      const text = cleanString(input?.[field]) || "1.0.0";
      if (!VERSION_PATTERN.test(text)) {
        fail(field, `${label} must look like a version (for example 1.0.0).`);
        return "";
      }
      if (required && !cleanString(input?.[field])) fail(field, `${label} is required.`);
      return text;
    },
    throwIfFailed() {
      if (!this.ok) {
        throw badRequest("Please fix the highlighted fields.", errors);
      }
    },
  };

  return api;
}

/** Validate a template payload for create/update (admin or migration). */
export function validateTemplate(input, { requirePublishable = false } = {}) {
  const validator = createValidator();
  const name = validator.text(input, "name", { required: true, min: 2, max: 160, label: "Template name" });
  const slug = validator.slug(input, "slug", { required: name ? false : true, label: "Slug" })
    || slugify(name);
  const description = validator.text(input, "description", { max: 600, label: "Description" });
  const longDescription = validator.text(input, "longDescription", { max: 20000, label: "Full description" });
  const version = validator.version(input, "version", { label: "Version" }) || "1.0.0";
  const license = validator.text(input, "license", { max: 80, label: "License" });
  const repositoryUrl = validator.url(input, "repositoryUrl", { label: "Repository URL" });
  const documentationUrl = validator.url(input, "documentationUrl", { label: "Documentation URL" });
  const downloadUrl = validator.url(input, "downloadUrl", { label: "Download URL" });
  const previewImage = validator.url(input, "previewImage", { label: "Preview image" });
  const sampleFile = validator.url(input, "sampleFile", { label: "Sample file" });
  const status = validator.enum(input, "status", TEMPLATE_STATUSES, { required: true, label: "Status" });
  const previewImages = validator.stringArray(input, "previewImages", { maxItems: 8, maxItemLength: 500 });

  if (requirePublishable && status === "published") {
    if (!description) validator.errors.description = "A published template needs a description.";
    if (!downloadUrl && !repositoryUrl) {
      validator.errors.downloadUrl = "A published template needs a download URL or a repository URL.";
    }
  }

  validator.throwIfFailed();

  return {
    name,
    slug: slug || slugify(name),
    description,
    longDescription,
    version,
    license,
    repositoryUrl,
    documentationUrl,
    downloadUrl,
    previewImage,
    previewImages,
    sampleFile,
    status,
    featured: validator.bool(input, "featured"),
    verified: validator.bool(input, "verified"),
    publisherId: cleanString(input?.publisherId) || null,
    categoryId: cleanString(input?.categoryId) || null,
    tags: validator.stringArray(input, "tags", { maxItems: 10 }),
    metadata: input?.metadata && typeof input.metadata === "object" ? input.metadata : {},
  };
}

export function validateCategory(input) {
  const validator = createValidator();
  const name = validator.text(input, "name", { required: true, min: 2, max: 80, label: "Category name" });
  const slug = validator.slug(input, "slug", { label: "Slug" }) || slugify(name);
  validator.throwIfFailed();
  return {
    name,
    slug,
    description: validator.text(input, "description", { max: 400, label: "Description" }),
    enabled: validator.bool(input, "enabled", true),
    sortOrder: Number.isFinite(Number(input?.sortOrder)) ? Number(input.sortOrder) : 0,
  };
}

export function validateTag(input) {
  const validator = createValidator();
  const name = validator.text(input, "name", { required: true, min: 2, max: 60, label: "Tag name" });
  const slug = validator.slug(input, "slug", { label: "Slug" }) || slugify(name);
  validator.throwIfFailed();
  return { name, slug };
}

export function validatePublisher(input) {
  const validator = createValidator();
  const name = validator.text(input, "name", { required: true, min: 2, max: 120, label: "Publisher name" });
  const slug = validator.slug(input, "slug", { label: "Slug" }) || slugify(name);
  const websiteUrl = validator.url(input, "websiteUrl", { label: "Website" });
  validator.throwIfFailed();
  return {
    name,
    slug,
    description: validator.text(input, "description", { max: 600, label: "Description" }),
    websiteUrl,
    avatarUrl: validator.url(input, "avatarUrl", { label: "Avatar" }),
    enabled: validator.bool(input, "enabled", true),
  };
}

/** Public submission payload — no accounts, everything optional but the basics. */
export function validateSubmission(input) {
  const validator = createValidator();
  const name = validator.text(input, "name", { required: true, min: 2, max: 160, label: "Template name" });
  validator.text(input, "description", { required: true, min: 10, max: 600, label: "Description" });
  validator.text(input, "longDescription", { max: 20000, label: "Full description" });
  validator.version(input, "version", { label: "Version" });
  validator.url(input, "repositoryUrl", { label: "Repository URL" });
  validator.url(input, "documentationUrl", { label: "Documentation URL" });
  validator.url(input, "downloadUrl", { label: "Download URL" });
  validator.url(input, "previewImage", { label: "Preview image" });
  validator.url(input, "sampleFile", { label: "Sample file" });
  validator.stringArray(input, "previewImages", { maxItems: 8, maxItemLength: 500 });
  validator.stringArray(input, "tags", { maxItems: 10 });
  if (input?.submitterEmail) validator.email(input, "submitterEmail", { label: "Email" });
  if (!validator.ok) validator.throwIfFailed();

  const hasAttachment = Boolean(
    (input?.downloadUrl && String(input.downloadUrl).trim())
    || (input?.repositoryUrl && String(input.repositoryUrl).trim()),
  );
  if (!hasAttachment) {
    throw badRequest("Please fix the highlighted fields.", {
      downloadUrl: "Add a download URL or a repository URL so reviewers can fetch the template.",
    });
  }

  return {
    name,
    description: validator.text(input, "description", { max: 600 }),
    longDescription: validator.text(input, "longDescription", { max: 20000 }),
    categoryId: cleanString(input?.categoryId) || null,
    publisherId: cleanString(input?.publisherId) || null,
    publisherName: validator.text(input, "publisherName", { max: 120 }),
    submitterName: validator.text(input, "submitterName", { max: 120 }),
    submitterEmail: cleanString(input?.submitterEmail) || null,
    version: validator.version(input, "version") || "1.0.0",
    license: validator.text(input, "license", { max: 80 }),
    repositoryUrl: validator.url(input, "repositoryUrl"),
    documentationUrl: validator.url(input, "documentationUrl"),
    downloadUrl: validator.url(input, "downloadUrl"),
    previewImage: validator.url(input, "previewImage"),
    previewImages: validator.stringArray(input, "previewImages", { maxItems: 8, maxItemLength: 500 }),
    sampleFile: validator.url(input, "sampleFile"),
    tags: validator.stringArray(input, "tags", { maxItems: 10 }),
  };
}

export { TEMPLATE_STATUSES, SUBMISSION_STATUSES };

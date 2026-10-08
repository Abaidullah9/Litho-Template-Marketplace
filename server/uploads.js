import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import multer from "multer";
import { uploadsRoot } from "./config.js";
import { badRequest } from "./errors.js";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);
const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/zip",
  "application/x-zip-compressed",
  "application/gzip",
  "application/x-tar",
  "application/octet-stream",
  "application/x-tex",
]);

const EXTENSIONS = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/markdown": ".md",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/gzip": ".gz",
  "application/x-tar": ".tar",
  "application/x-tex": ".tex",
};

mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadsRoot),
  filename: (req, file, callback) => {
    const safeBase = path.basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "upload";
    callback(null, `${Date.now()}-${randomBytes(4).toString("hex")}-${safeBase}${EXTENSIONS[file.mimetype] || path.extname(file.originalname).toLowerCase().slice(0, 6)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 4, fields: 40 },
  fileFilter: (req, file, callback) => {
    const isImage = IMAGE_TYPES.has(file.mimetype);
    const isDocument = file.fieldname === "sampleFile" && DOCUMENT_TYPES.has(file.mimetype);
    if (!isImage && !isDocument) {
      callback(badRequest(`Unsupported file type "${file.mimetype}". Use an image for previews and PDF/ZIP/TXT for sample files.`));
      return;
    }
    callback(null, true);
  },
});

/** Translate multer errors into safe API errors. */
export function handleUploadError(error, req, res, next) {
  if (!error) return next();
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Files must be 15 MB or smaller."
      : `Upload failed: ${error.message}`;
    next(badRequest(message));
    return;
  }
  next(error);
}

/** Public path for an uploaded file, or null. */
export function uploadedPath(file) {
  return file ? `/uploads/${file.filename}` : null;
}

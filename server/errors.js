/** HTTP errors that carry a stable API code and a safe public message. */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export const badRequest = (message, details) => new ApiError(400, "bad_request", message, details);
export const unauthorized = (message = "Admin authentication required.") => new ApiError(401, "unauthorized", message);
export const forbidden = (message = "Not allowed.") => new ApiError(403, "forbidden", message);
export const notFound = (message = "Resource not found.") => new ApiError(404, "not_found", message);
export const conflict = (message, details) => new ApiError(409, "conflict", message, details);
export const unconfigured = (message) => new ApiError(503, "not_configured", message);
export const upstream = (message = "Database request failed.") => new ApiError(502, "upstream_error", message);

export function toErrorResponse(error) {
  if (error instanceof ApiError) {
    const body = { error: { code: error.code, message: error.message } };
    if (error.details !== undefined) body.error.details = error.details;
    return { status: error.status, body };
  }
  // Never leak internal errors, SQL or credentials to the client.
  return {
    status: 500,
    body: { error: { code: "internal_error", message: "Something went wrong. Please try again." } },
  };
}

/** Wrap an async route handler so rejected promises reach the error middleware. */
export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

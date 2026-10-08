/**
 * Port of `api()` from site/assets/js/admin/admin.js.
 *
 * Same credentials, same JSON/multipart handling, same `error.details` field map, and the same
 * 401 redirect to the sign-in page so an expired session never leaves a page spinning.
 */

export type ApiDetails = Record<string, string>;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: ApiDetails;

  constructor(message: string, { status = 0, code = "error", details }: { status?: number; code?: string; details?: ApiDetails } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
};

type ApiPayload = {
  error?: { message?: string; code?: string; details?: ApiDetails };
} & Record<string, unknown>;

export async function api<T = ApiPayload>(path: string, { method = "GET", body, formData }: ApiOptions = {}): Promise<T> {
  const init: RequestInit = { method, credentials: "same-origin", headers: {} };
  if (formData) init.body = formData;
  else if (body !== undefined) {
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError("Cannot reach the server. Is it still running?", { code: "network" });
  }

  const text = await response.text();
  let payload: ApiPayload | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiPayload;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = new ApiError(payload?.error?.message || `Request failed (${response.status})`, {
      status: response.status,
      code: payload?.error?.code,
      details: payload?.error?.details,
    });
    if (response.status === 401 && !path.endsWith("/login")) {
      const alreadyThere = window.location.pathname !== "/admin/login";
      window.location.href = `/admin/login${alreadyThere ? `?next=${encodeURIComponent(window.location.pathname)}` : ""}`;
    }
    throw error;
  }
  return payload as T;
}

export const get = <T = ApiPayload>(path: string) => api<T>(path);
export const post = <T = ApiPayload>(path: string, body?: unknown) => api<T>(path, { method: "POST", body });
export const put = <T = ApiPayload>(path: string, body?: unknown) => api<T>(path, { method: "PUT", body });
export const del = <T = ApiPayload>(path: string, body?: unknown) => api<T>(path, { method: "DELETE", body });

/**
 * Shared admin dashboard client.
 *
 * Renders the shell (sidebar + topbar), guards the session, and exposes the
 * API/formatting helpers every admin page uses. No framework: the marketplace
 * is plain HTML/CSS/JS and the admin panel stays that way.
 */

const NAV = [
  { group: "Overview" },
  { href: "/admin", key: "dashboard", label: "Dashboard" },
  { group: "Marketplace" },
  { href: "/admin/templates", key: "templates", label: "Templates" },
  { href: "/admin/templates/new", key: "template-new", label: "New template" },
  { href: "/admin/submissions", key: "submissions", label: "Submissions", count: "pendingSubmissions" },
  { group: "Taxonomy" },
  { href: "/admin/categories", key: "categories", label: "Categories" },
  { href: "/admin/tags", key: "tags", label: "Tags" },
  { href: "/admin/publishers", key: "publishers", label: "Publishers" },
  { group: "Insights" },
  { href: "/admin/analytics", key: "analytics", label: "Analytics" },
  { href: "/admin/registry", key: "registry", label: "Registry" },
  { group: "System" },
  { href: "/admin/activity", key: "activity", label: "Activity" },
  { href: "/admin/settings", key: "settings", label: "Settings" },
];

export class ApiError extends Error {
  constructor(message, { status = 0, code = "error", details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Whether this document is the sign-in page. Sending a 401 on that page "back" to itself is an
 * endless reload — the page probes /api/admin/session to skip the form for a live session, and
 * that probe is expected to fail while the visitor is still signing in.
 */
function onSignInPage() {
  return /\/admin\/login(\.html)?$/.test(window.location.pathname);
}

export async function api(path, { method = "GET", body, formData } = {}) {
  const init = { method, credentials: "same-origin", headers: {} };
  if (formData) init.body = formData;
  else if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError("Cannot reach the server. Is it still running?", { code: "network" });
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = new ApiError(
      payload?.error?.message || `Request failed (${response.status})`,
      { status: response.status, code: payload?.error?.code, details: payload?.error?.details },
    );
    if (response.status === 401 && !path.endsWith("/login") && !onSignInPage()) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw error;
  }
  return payload;
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: "POST", body });
export const put = (path, body) => api(path, { method: "PUT", body });
export const del = (path, body) => api(path, { method: "DELETE", body });

// ---------------------------------------------------------------- shell

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function queryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === "" || value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function mountAdmin({ active = "", title = "Dashboard", crumb = "Admin", actions = "" } = {}) {
  document.body.classList.add("admin-page");
  const counts = readCounts();

  const navHtml = NAV.map((item) => {
    if (item.group) return `<div class="nav-group">${escapeHtml(item.group)}</div>`;
    const count = item.count ? counts[item.count] : null;
    const badge = count ? `<span class="nav-count">${Number(count)}</span>` : "";
    return `<a href="${item.href}" class="${item.key === active ? "active" : ""}">${escapeHtml(item.label)}${badge}</a>`;
  }).join("");

  document.body.innerHTML = `
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <a class="admin-brand" href="/">
          <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width="656" height="192">
          <span>Admin</span>
        </a>
        <nav class="admin-nav" aria-label="Admin navigation">${navHtml}</nav>
        <div class="admin-sidebar-foot">
          <a class="btn ghost small" href="/" target="_blank" rel="noreferrer">View marketplace ↗</a>
          <button class="btn ghost small" type="button" data-action="theme">Toggle theme</button>
          <button class="btn ghost small" type="button" data-action="logout">Sign out</button>
        </div>
      </aside>
      <div class="admin-main">
        <header class="admin-topbar">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <button class="btn ghost small menu-toggle" type="button" data-action="menu" aria-expanded="false" aria-controls="admin-sidebar">Menu</button>
            <div style="min-width:0">
              <div class="crumbs">${escapeHtml(crumb)}</div>
              <h1>${escapeHtml(title)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${actions}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `;

  document.body.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "logout") {
      post("/api/admin/logout").catch(() => {});
      window.location.href = "/admin/login";
    }
    if (action === "menu") {
      const sidebar = document.getElementById("admin-sidebar");
      const open = sidebar.classList.toggle("open");
      event.target.closest("[data-action]").setAttribute("aria-expanded", String(open));
    }
    if (action === "theme") toggleTheme();
  });

  return {
    body: document.getElementById("admin-content"),
    actions: document.getElementById("admin-actions"),
    setActions(html) {
      document.getElementById("admin-actions").innerHTML = html;
    },
  };
}

function readCounts() {
  try {
    return JSON.parse(sessionStorage.getItem("admin:counts") || "{}");
  } catch {
    return {};
  }
}

export function storeCounts(counts) {
  try {
    sessionStorage.setItem("admin:counts", JSON.stringify(counts));
  } catch {
    /* storage is optional */
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";      root.dataset.theme = next;
      try {
        localStorage.setItem("litho-theme", next);
  } catch {
    /* storage is optional */
  }
}

export async function requireSession() {
  await get("/api/admin/session");
}

// ---------------------------------------------------------------- feedback

export function toast(message, kind = "") {
  const host = document.getElementById("admin-toast");
  if (!host) return;
  const item = document.createElement("div");
  item.className = `toast-item ${kind}`;
  item.textContent = message;
  host.appendChild(item);
  setTimeout(() => item.remove(), 4200);
}

export function confirmAction(message, { confirmLabel = "Confirm", danger = true } = {}) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "modal";
    dialog.innerHTML = `
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${escapeHtml(message)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${danger ? "danger" : "primary"}" type="button" data-confirm>${escapeHtml(confirmLabel)}</button>
      </div>
    `;
    document.body.appendChild(dialog);
    const finish = (value) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    dialog.querySelector("[data-cancel]").addEventListener("click", () => finish(false));
    dialog.querySelector("[data-confirm]").addEventListener("click", () => finish(true));
    dialog.addEventListener("cancel", () => finish(false));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) finish(false); });
    dialog.showModal();
  });
}

/**
 * Generic edit modal used by the category/tag/publisher tables.
 * fields: [{ name, label, type, value, required, hint, placeholder, options }]
 */
export function editModal({ title, fields, submitLabel = "Save", onSubmit }) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "modal";
    const controls = fields.map((field) => {
      const id = `field-${field.name}`;
      const value = escapeHtml(field.value ?? "");
      let control;
      if (field.type === "textarea") {
        control = `<textarea id="${id}" name="${field.name}" rows="3" placeholder="${escapeHtml(field.placeholder || "")}">${value}</textarea>`;
      } else if (field.type === "checkbox") {
        control = `<label class="checkbox-field"><input type="checkbox" id="${id}" name="${field.name}" ${field.value ? "checked" : ""}> ${escapeHtml(field.checkboxLabel || "Enabled")}</label>`;
      } else if (field.type === "select") {
        control = `<select id="${id}" name="${field.name}">${(field.options || []).map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === field.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>`;
      } else {
        control = `<input type="${field.type || "text"}" id="${id}" name="${field.name}" value="${value}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""}>`;
      }
      return `
        <div class="field ${field.wide ? "full" : ""}">
          <label for="${id}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label>
          ${control}
          ${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}
          <span class="field-error" data-error-for="${field.name}"></span>
        </div>`;
    }).join("");

    dialog.innerHTML = `
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${escapeHtml(title)}</h2></div>
        <div class="panel-body"><div class="form-grid">${controls}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${escapeHtml(submitLabel)}</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);

    const close = (value) => { dialog.close(); dialog.remove(); resolve(value); };
    dialog.querySelector("[data-cancel]").addEventListener("click", () => close(null));
    dialog.addEventListener("cancel", () => close(null));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(null); });

    const form = dialog.querySelector("form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      dialog.querySelectorAll("[data-error-for]").forEach((node) => { node.textContent = ""; });
      const values = {};
      for (const field of fields) {
        const input = dialog.querySelector(`[name="${field.name}"]`);
        if (!input) continue;
        values[field.name] = input.type === "checkbox" ? input.checked : input.value;
      }
      try {
        const result = await onSubmit(values);
        close(result);
      } catch (error) {
        if (error.details) {
          for (const [name, message] of Object.entries(error.details)) {
            const node = dialog.querySelector(`[data-error-for="${name}"]`);
            if (node) node.textContent = message;
          }
        }
        toast(error.message, "error");
      }
    });

    dialog.showModal();
    dialog.querySelector("input, select, textarea")?.focus();
  });
}

// ---------------------------------------------------------------- helpers

export function fmtNumber(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (number >= 10_000) return `${(number / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return number.toLocaleString("en-US");
}

export function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function timeAgo(value) {
  if (!value) return "—";
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "—";
  const units = [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [size, label] of units) {
    if (Math.abs(seconds) >= size) return `${Math.round(seconds / size)}${label} ago`;
  }
  return "just now";
}

export function statusBadge(status) {
  const label = String(status || "unknown");
  return `<span class="badge ${escapeHtml(label)}">${escapeHtml(label)}</span>`;
}

export function flagsBadges(row) {
  const badges = [];
  if (row.featured) badges.push('<span class="badge featured">featured</span>');
  if (row.verified) badges.push('<span class="badge verified">verified</span>');
  return badges.join(" ");
}

export function renderPagination(host, { page, pages, total, onPage }) {
  host.innerHTML = `
    <div class="pagination">
      <span>${fmtNumber(total)} result${total === 1 ? "" : "s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${page <= 1 ? "disabled" : ""}>← Prev</button>
        <span>Page ${page} / ${pages}</span>
        <button class="btn ghost small" type="button" data-next ${page >= pages ? "disabled" : ""}>Next →</button>
      </div>
    </div>
  `;
  host.querySelector("[data-prev]")?.addEventListener("click", () => onPage(page - 1));
  host.querySelector("[data-next]")?.addEventListener("click", () => onPage(page + 1));
}

export function showFormErrors(form, details = {}) {
  form.querySelectorAll(".field-error").forEach((node) => { node.textContent = ""; });
  form.querySelectorAll("[aria-invalid]").forEach((node) => node.removeAttribute("aria-invalid"));
  for (const [name, message] of Object.entries(details)) {
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (error) error.textContent = message;
    const input = form.querySelector(`[name="${name}"]`);
    if (input) input.setAttribute("aria-invalid", "true");
  }
}

export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Fill a <select> with options, keeping the current selection. */
export function fillSelect(select, items, { placeholder = "All", valueKey = "slug", labelKey = "name" } = {}) {
  const current = select.value;
  const options = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : "";
  select.innerHTML = options + items.map((item) => (
    `<option value="${escapeHtml(item[valueKey])}">${escapeHtml(item[labelKey])}${item.templateCount !== undefined ? ` (${item.templateCount})` : ""}</option>`
  )).join("");
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

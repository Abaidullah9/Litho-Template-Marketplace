import {
  confirmAction,
  debounce,
  del,
  escapeHtml,
  fillSelect,
  flagsBadges,
  fmtNumber,
  get,
  mountAdmin,
  post,
  queryString,
  renderPagination,
  requireSession,
  statusBadge,
  toast,
} from "./admin.js";

const shell = mountAdmin({
  active: "templates",
  title: "Templates",
  crumb: "Admin / Marketplace",
  actions: '<a class="btn primary" href="/admin/templates/new">+ New template</a>',
});

await requireSession();

const state = {
  q: new URLSearchParams(window.location.search).get("q") || "",
  status: new URLSearchParams(window.location.search).get("status") || "",
  category: "",
  publisher: "",
  verified: "",
  featured: "",
  sort: "newest",
  page: 1,
  selected: new Set(),
};

shell.body.innerHTML = `
  <section class="panel">
    <div class="toolbar">
      <div class="field grow">
        <label for="filter-q">Search</label>
        <input type="search" id="filter-q" placeholder="name, slug, description…" value="${escapeHtml(state.q)}">
      </div>
      <div class="field">
        <label for="filter-status">Status</label>
        <select id="filter-status">
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-category">Category</label>
        <select id="filter-category"></select>
      </div>
      <div class="field">
        <label for="filter-publisher">Publisher</label>
        <select id="filter-publisher"></select>
      </div>
      <div class="field">
        <label for="filter-verified">Verified</label>
        <select id="filter-verified">
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-featured">Featured</label>
        <select id="filter-featured">
          <option value="">All</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-sort">Sort</label>
        <select id="filter-sort">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="updated">Recently updated</option>
          <option value="name">A–Z</option>
          <option value="views">Most viewed</option>
          <option value="downloads">Most downloaded</option>
        </select>
      </div>
      <button class="btn ghost" type="button" id="filter-reset">Reset</button>
    </div>
    <div class="toolbar" id="bulk-bar" hidden>
      <div class="field">
        <label for="bulk-action">Bulk action</label>
        <select id="bulk-action">
          <option value="">Choose…</option>
          <option value="publish">Publish</option>
          <option value="unpublish">Unpublish</option>
          <option value="archive">Archive</option>
          <option value="verify">Verify</option>
          <option value="unverify">Unverify</option>
          <option value="feature">Feature</option>
          <option value="unfeature">Unfeature</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      <button class="btn" type="button" id="bulk-apply">Apply</button>
      <span class="field-hint" id="bulk-count"></span>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="checkbox-cell"><input type="checkbox" id="select-all" aria-label="Select all templates on this page"></th>
            <th>Template</th>
            <th>Status</th>
            <th>Category</th>
            <th>Publisher</th>
            <th class="numeric">Views</th>
            <th class="numeric">Downloads</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="templates-body"></tbody>
      </table>
    </div>
    <div id="templates-empty" class="empty" hidden>
      <h3>No templates match</h3>
      <p>Adjust the filters, or add the first template.</p>
      <a class="btn primary" href="/admin/templates/new">+ New template</a>
    </div>
    <div id="templates-pagination"></div>
  </section>
`;

const body = document.getElementById("templates-body");
const empty = document.getElementById("templates-empty");
const paginationHost = document.getElementById("templates-pagination");

document.getElementById("filter-status").value = state.status;
document.getElementById("filter-sort").value = state.sort;

const [categories, publishers] = await Promise.all([
  get("/api/admin/categories").catch(() => []),
  get("/api/admin/publishers").catch(() => []),
]);
fillSelect(document.getElementById("filter-category"), categories);
fillSelect(document.getElementById("filter-publisher"), publishers);

const applyFilters = debounce(() => {
  state.page = 1;
  state.selected.clear();
  load();
}, 250);

document.getElementById("filter-q").addEventListener("input", (event) => {
  state.q = event.target.value;
  applyFilters();
});
for (const [id, key] of [
  ["filter-status", "status"],
  ["filter-category", "category"],
  ["filter-publisher", "publisher"],
  ["filter-verified", "verified"],
  ["filter-featured", "featured"],
  ["filter-sort", "sort"],
]) {
  document.getElementById(id).addEventListener("change", (event) => {
    state[key] = event.target.value;
    state.page = 1;
    state.selected.clear();
    load();
  });
}
document.getElementById("filter-reset").addEventListener("click", () => {
  Object.assign(state, { q: "", status: "", category: "", publisher: "", verified: "", featured: "", sort: "newest", page: 1 });
  document.getElementById("filter-q").value = "";
  for (const [id, key] of [["filter-status", "status"], ["filter-category", "category"], ["filter-publisher", "publisher"], ["filter-verified", "verified"], ["filter-featured", "featured"], ["filter-sort", "sort"]]) {
    document.getElementById(id).value = state[key];
  }
  load();
});

document.getElementById("select-all").addEventListener("change", (event) => {
  for (const id of event.target.dataset.ids ? JSON.parse(event.target.dataset.ids) : []) {
    if (event.target.checked) state.selected.add(id);
    else state.selected.delete(id);
  }
  syncBulkBar();
  body.querySelectorAll("input[data-select]").forEach((input) => { input.checked = event.target.checked; });
});

document.getElementById("bulk-apply").addEventListener("click", async () => {
  const action = document.getElementById("bulk-action").value;
  if (!action) return;
  const ids = [...state.selected];
  if (!ids.length) return;
  const destructive = action === "delete" || action === "archive" || action === "unpublish";
  if (destructive) {
    const ok = await confirmAction(
      `${action} ${ids.length} template${ids.length === 1 ? "" : "s"}? ${action === "delete" ? "Deleted templates cannot be restored." : ""}`,
      { confirmLabel: action === "delete" ? "Delete" : "Apply" },
    );
    if (!ok) return;
  }
  try {
    const result = await post("/api/admin/templates/bulk", { action, ids });
    toastAndReload(`${result.count} template(s) affected by "${action}"`);
  } catch (error) {
    toast(error.message, "error");
  }
});

function toastAndReload(message) {
  toast(message, "success");
  state.selected.clear();
  load();
}

function syncBulkBar() {
  const bar = document.getElementById("bulk-bar");
  bar.hidden = state.selected.size === 0;
  document.getElementById("bulk-count").textContent = `${state.selected.size} selected`;
}

async function load() {
  body.innerHTML = '<tr><td colspan="9" style="color:var(--muted);padding:24px">Loading templates…</td></tr>';
  empty.hidden = true;
  try {
    const data = await get(`/api/admin/templates${queryString({
      q: state.q,
      status: state.status,
      category: state.category,
      publisher: state.publisher,
      verified: state.verified,
      featured: state.featured,
      sort: state.sort,
      page: state.page,
    })}`);

    if (!data.items.length) {
      body.innerHTML = "";
      empty.hidden = false;
      paginationHost.innerHTML = "";
      return;
    }

    body.innerHTML = data.items.map((row) => `
      <tr data-id="${escapeHtml(row.id)}">
        <td class="checkbox-cell"><input type="checkbox" data-select aria-label="Select ${escapeHtml(row.name)}" ${state.selected.has(row.id) ? "checked" : ""}></td>
        <td>
          <a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
          <span class="row-sub">${escapeHtml(row.slug)} · v${escapeHtml(row.version || "1.0.0")}</span>
        </td>
        <td>${statusBadge(row.status)} ${flagsBadges(row)}</td>
        <td>${escapeHtml(row.categoryName || "—")}</td>
        <td>${escapeHtml(row.publisherName || "—")}</td>
        <td class="numeric">${fmtNumber(row.views)}</td>
        <td class="numeric">${fmtNumber(row.downloads)}</td>
        <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${new Date(row.updated_at).toLocaleDateString("en-GB")}</td>
        <td class="actions">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn small" type="button" data-quick="${row.status === "published" ? "unpublish" : "publish"}">${row.status === "published" ? "Unpublish" : "Publish"}</button>
            <button class="btn ghost small" type="button" data-quick="${row.verified ? "unverify" : "verify"}">${row.verified ? "Unverify" : "Verify"}</button>
            <button class="btn ghost small" type="button" data-quick="${row.featured ? "unfeature" : "feature"}">${row.featured ? "Unfeature" : "Feature"}</button>
            <a class="btn ghost small" href="/admin/templates/new?id=${encodeURIComponent(row.id)}">Edit</a>
            <button class="btn danger small" type="button" data-delete>Delete</button>
          </div>
        </td>
      </tr>`).join("");

    document.getElementById("select-all").dataset.ids = JSON.stringify(data.items.map((row) => row.id));
    document.getElementById("select-all").checked = false;
    syncBulkBar();

    renderPagination(paginationHost, {
      page: data.page,
      pages: data.pages,
      total: data.total,
      onPage: (page) => { state.page = page; load(); },
    });
  } catch (error) {
    body.innerHTML = `<tr><td colspan="9" style="color:#f18c75;padding:24px">${escapeHtml(error.message)}</td></tr>`;
  }
}

body.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-select]");
  if (!input) return;
  const id = input.closest("tr").dataset.id;
  if (input.checked) state.selected.add(id);
  else state.selected.delete(id);
  syncBulkBar();
});

body.addEventListener("click", async (event) => {
  const row = event.target.closest("tr[data-id]");
  if (!row) return;
  const id = row.dataset.id;

  const quick = event.target.closest("[data-quick]");
  if (quick) {
    try {
      await post(`/api/admin/templates/${encodeURIComponent(id)}/${quick.dataset.quick}`, {});
      toast(`Template ${quick.dataset.quick}d`, "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
    return;
  }

  if (event.target.closest("[data-delete]")) {
    const ok = await confirmAction("Delete this template permanently? This cannot be undone.", { confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await del(`/api/admin/templates/${encodeURIComponent(id)}`);
      toast("Template deleted", "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

await load();

// Refresh the sidebar badge counts after the first load.
import("./admin.js").then(({ get: apiGet, storeCounts: store }) => {
  apiGet("/api/admin/dashboard")
    .then((stats) => store({ pendingSubmissions: stats.counts.pending }))
    .catch(() => {});
});

import {
  confirmAction,
  escapeHtml,
  fmtDateTime,
  get,
  mountAdmin,
  post,
  queryString,
  renderPagination,
  requireSession,
  statusBadge,
  toast,
} from "./admin.js";

const initialStatus = new URLSearchParams(window.location.search).get("status") || "pending";

const shell = mountAdmin({
  active: "submissions",
  title: "Submissions",
  crumb: "Admin / Marketplace / Review queue",
});

await requireSession();

const state = { status: initialStatus, page: 1 };

shell.body.innerHTML = `
  <div class="toolbar" style="border:1px solid var(--line);background:var(--panel);border-bottom:none;margin-bottom:16px">
    <div class="field">
      <label for="status-filter">Show</label>
      <select id="status-filter">
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="">All</option>
      </select>
    </div>
    <span class="field-hint" style="align-self:center">Visitors submit templates without an account; every submission lands here for review.</span>
  </div>
  <div id="submissions-list"></div>
  <div id="submissions-pagination"></div>
`;

document.getElementById("status-filter").value = state.status;
document.getElementById("status-filter").addEventListener("change", (event) => {
  state.status = event.target.value;
  state.page = 1;
  load();
});

const list = document.getElementById("submissions-list");
const paginationHost = document.getElementById("submissions-pagination");

async function load() {
  list.innerHTML = '<div class="empty"><h3>Loading…</h3></div>';
  try {
    const data = await get(`/api/admin/submissions${queryString({ status: state.status, page: state.page })}`);
    if (!data.items.length) {
      list.innerHTML = `
        <div class="empty">
          <h3>Nothing here</h3>
          <p>${state.status === "pending" ? "The review queue is empty." : "No submissions with this status."}</p>
        </div>`;
      paginationHost.innerHTML = "";
      return;
    }

    list.innerHTML = data.items.map((row) => `
      <article class="submission-card" data-id="${escapeHtml(row.id)}">
        <h3>${escapeHtml(row.name)}</h3>
        <div class="meta">
          ${statusBadge(row.status)}
          ${escapeHtml(row.categoryName || "no category")} ·
          ${escapeHtml(row.publisherName || row.submitter_name || "anonymous")} ·
          submitted ${fmtDateTime(row.created_at)}
          ${row.reviewed_at ? ` · reviewed ${fmtDateTime(row.reviewed_at)}` : ""}
        </div>
        <p class="desc">${escapeHtml(row.description || "")}</p>
        <div>
          ${(row.tags || []).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}
          <span class="tag-chip">v${escapeHtml(row.version || "1.0.0")}</span>
          ${row.license ? `<span class="tag-chip">${escapeHtml(row.license)}</span>` : ""}
        </div>
        ${row.long_description ? `<details style="margin-top:10px"><summary class="field-hint" style="cursor:pointer">Full description</summary><p class="desc" style="margin-top:8px">${escapeHtml(row.long_description)}</p></details>` : ""}
        ${row.reject_reason ? `<div class="notice error" style="margin-top:12px">Rejected: ${escapeHtml(row.reject_reason)}</div>` : ""}
        <div class="links" style="margin-top:10px;display:flex;gap:14px;flex-wrap:wrap">
          ${row.download_url ? `<a class="field-hint" href="${escapeHtml(row.download_url)}" target="_blank" rel="noreferrer">download ↗</a>` : ""}
          ${row.repository_url ? `<a class="field-hint" href="${escapeHtml(row.repository_url)}" target="_blank" rel="noreferrer">repository ↗</a>` : ""}
          ${row.documentation_url ? `<a class="field-hint" href="${escapeHtml(row.documentation_url)}" target="_blank" rel="noreferrer">documentation ↗</a>` : ""}
          ${row.preview_image ? `<a class="field-hint" href="${escapeHtml(row.preview_image)}" target="_blank" rel="noreferrer">preview ↗</a>` : ""}
          ${row.sample_file ? `<a class="field-hint" href="${escapeHtml(row.sample_file)}" target="_blank" rel="noreferrer">sample file ↗</a>` : ""}
        </div>
        <div class="actions">
          ${row.status !== "approved" ? `
            <button class="btn primary" type="button" data-approve>Approve & publish</button>
            <button class="btn" type="button" data-approve-draft>Approve as draft</button>` : `
            <a class="btn primary" href="/admin/templates/new?id=${encodeURIComponent(row.template_id || "")}">Open template →</a>`}
          ${row.status !== "rejected" ? '<button class="btn danger" type="button" data-reject>Reject</button>' : ""}
        </div>
      </article>`).join("");

    renderPagination(paginationHost, {
      page: data.page,
      pages: data.pages,
      total: data.total,
      onPage: (page) => { state.page = page; load(); },
    });
  } catch (error) {
    list.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

list.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  const id = card.dataset.id;

  if (event.target.closest("[data-approve]")) {
    try {
      const result = await post(`/api/admin/submissions/${encodeURIComponent(id)}/approve`, { status: "published" });
      toast(`Published “${result.template.name}” — regenerate the registry to list it.`, "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  if (event.target.closest("[data-approve-draft]")) {
    try {
      const result = await post(`/api/admin/submissions/${encodeURIComponent(id)}/approve`, { status: "draft" });
      toast(`Created draft “${result.template.name}”.`, "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  if (event.target.closest("[data-reject]")) {
    const reason = window.prompt("Rejection reason (optional):", "");
    if (reason === null) return;
    try {
      await post(`/api/admin/submissions/${encodeURIComponent(id)}/reject`, { reason: reason.trim() });
      toast("Submission rejected", "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

await load();

get("/api/admin/dashboard")
  .then((stats) => import("./admin.js").then(({ storeCounts }) => storeCounts({ pendingSubmissions: stats.counts.pending })))
  .catch(() => {});

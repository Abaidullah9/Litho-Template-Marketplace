import {
  escapeHtml,
  fmtDateTime,
  get,
  mountAdmin,
  queryString,
  renderPagination,
  requireSession,
} from "./admin.js";

const shell = mountAdmin({
  active: "activity",
  title: "Activity log",
  crumb: "Admin / System / Activity",
});

await requireSession();

const state = { page: 1, entity: "" };

shell.body.innerHTML = `
  <div class="notice">
    Every important admin action is recorded with <code>action</code>, <code>entity</code>,
    <code>entity_id</code>, <code>timestamp</code> and <code>metadata</code>.
  </div>
  <div class="toolbar" style="border:1px solid var(--line);background:var(--panel);border-bottom:none;margin-bottom:16px">
    <div class="field">
      <label for="entity-filter">Entity</label>
      <select id="entity-filter">
        <option value="">All</option>
        <option value="template">Templates</option>
        <option value="submission">Submissions</option>
        <option value="category">Categories</option>
        <option value="tag">Tags</option>
        <option value="publisher">Publishers</option>
        <option value="registry">Registry</option>
        <option value="settings">Settings</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  </div>
  <section class="panel">
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Record</th><th>Actor</th><th>Metadata</th></tr></thead>
        <tbody id="activity-body"></tbody>
      </table>
    </div>
    <div class="empty" id="activity-empty" hidden>
      <h3>No activity recorded</h3>
      <p>Actions appear here as soon as admins change things.</p>
    </div>
    <div id="activity-pagination"></div>
  </section>
`;

const body = document.getElementById("activity-body");
const empty = document.getElementById("activity-empty");

document.getElementById("entity-filter").addEventListener("change", (event) => {
  state.entity = event.target.value;
  state.page = 1;
  load();
});

async function load() {
  body.innerHTML = '<tr><td colspan="6" style="color:var(--muted);padding:24px">Loading…</td></tr>';
  try {
    const data = await get(`/api/admin/activity${queryString({ page: state.page, entity: state.entity })}`);
    if (!data.items.length) {
      body.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    body.innerHTML = data.items.map((row) => `
      <tr>
        <td style="font-family:var(--mono);font-size:11px;white-space:nowrap">${fmtDateTime(row.created_at)}</td>
        <td><span class="badge">${escapeHtml(row.action)}</span></td>
        <td style="font-family:var(--mono);font-size:11px">${escapeHtml(row.entity)}</td>
        <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${escapeHtml(shortId(row.entity_id))}</td>
        <td style="font-family:var(--mono);font-size:11px">${escapeHtml(row.actor)}</td>
        <td style="font-family:var(--mono);font-size:10px;color:var(--muted);max-width:340px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(JSON.stringify(row.metadata))}</td>
      </tr>`).join("");

    renderPagination(document.getElementById("activity-pagination"), {
      page: data.page,
      pages: data.pages,
      total: data.total,
      onPage: (page) => { state.page = page; load(); },
    });
  } catch (error) {
    body.innerHTML = `<tr><td colspan="6" style="color:#f18c75;padding:24px">${escapeHtml(error.message)}</td></tr>`;
  }
}

function shortId(value) {
  if (!value) return "—";
  const text = String(value);
  return text.length > 24 ? `${text.slice(0, 21)}…` : text;
}

await load();

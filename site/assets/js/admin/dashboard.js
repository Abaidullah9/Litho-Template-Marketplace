import {
  escapeHtml,
  fmtDate,
  fmtNumber,
  get,
  mountAdmin,
  requireSession,
  statusBadge,
  storeCounts,
  timeAgo,
} from "./admin.js";

const shell = mountAdmin({
  active: "dashboard",
  title: "Dashboard",
  crumb: "Admin / Overview",
  actions: '<a class="btn primary" href="/admin/registry">Generate registry</a>',
});

await requireSession();

shell.body.innerHTML = '<div class="empty"><h3>Loading marketplace stats…</h3></div>';

try {
  const stats = await get("/api/admin/dashboard");
  storeCounts({ pendingSubmissions: stats.counts.pending });
  render(stats);
} catch (error) {
  shell.body.innerHTML = `
    <div class="notice error">
      <strong>Could not load the dashboard.</strong><br>${escapeHtml(error.message)}
    </div>`;
}

function render(stats) {
  const counts = stats.counts;
  const cards = [
    ["Total templates", counts.templates, "all statuses"],
    ["Published", counts.published, "live in the marketplace"],
    ["Pending submissions", counts.pending, "waiting for review", counts.pending > 0],
    ["Drafts", counts.draft, "not public"],
    ["Featured", counts.featured, "homepage slots"],
    ["Verified", counts.verified, "manual verification"],
    ["Total views", counts.views, "template detail views"],
    ["Total downloads", counts.downloads, "download events"],
    ["Categories", counts.categories, "template categories"],
    ["Tags", counts.tags, "reusable tags"],
    ["Publishers", counts.publishers, "template authors"],
    ["Archived", counts.archived, "removed from the market"],
  ];

  shell.body.innerHTML = `
    <div class="stat-grid">
      ${cards.map(([label, value, note, accent]) => `
        <div class="stat-card ${accent ? "accent" : ""}">
          <span class="stat-label">${escapeHtml(label)}</span>
          <span class="stat-value">${fmtNumber(value)}</span>
          <span class="stat-note">${escapeHtml(note)}</span>
        </div>`).join("")}
    </div>

    <div class="grid-2">
      <section class="panel">
        <div class="panel-head">
          <h2>Recent submissions</h2>
          <a class="btn ghost small" href="/admin/submissions">Review all →</a>
        </div>
        <div class="list-rows">
          ${stats.recentSubmissions.length
            ? stats.recentSubmissions.map((row) => `
              <div class="list-row">
                <div class="primary">
                  <a href="/admin/submissions?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
                  <div class="meta">${escapeHtml(row.submitter_name || "anonymous")} · ${timeAgo(row.created_at)}</div>
                </div>
                <div class="side">${statusBadge(row.status)}</div>
              </div>`).join("")
            : '<div class="empty"><h3>No pending submissions</h3><p>The review queue is clear.</p></div>'}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Recent templates</h2>
          <a class="btn ghost small" href="/admin/templates">All templates →</a>
        </div>
        <div class="list-rows">
          ${stats.recentTemplates.length
            ? stats.recentTemplates.map((row) => `
              <div class="list-row">
                <div class="primary">
                  <a href="/admin/templates/new?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
                  <div class="meta">${timeAgo(row.created_at)} · ${fmtNumber(row.views)} views · ${fmtNumber(row.downloads)} downloads</div>
                </div>
                <div class="side">${statusBadge(row.status)}</div>
              </div>`).join("")
            : '<div class="empty"><h3>No templates yet</h3><p>Seed the database or migrate the registry.</p></div>'}
        </div>
      </section>
    </div>

    <div class="grid-2">
      <section class="panel">
        <div class="panel-head">
          <h2>Most viewed</h2>
          <a class="btn ghost small" href="/admin/analytics">Analytics →</a>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Template</th><th class="numeric">Views</th><th class="numeric">Downloads</th></tr></thead>
            <tbody>
              ${stats.topViewed.length ? stats.topViewed.map((row) => `
                <tr>
                  <td><a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
                    <span class="row-sub">${escapeHtml(row.slug)}</span></td>
                  <td class="numeric">${fmtNumber(row.views)}</td>
                  <td class="numeric">${fmtNumber(row.downloads)}</td>
                </tr>`).join("") : '<tr><td colspan="3" style="color:var(--muted)">No published templates yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Most downloaded</h2>
          <span class="field-hint">all time</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Template</th><th class="numeric">Downloads</th><th class="numeric">Published</th></tr></thead>
            <tbody>
              ${stats.topDownloaded.length ? stats.topDownloaded.map((row) => `
                <tr>
                  <td><a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
                    <span class="row-sub">${escapeHtml(row.slug)}</span></td>
                  <td class="numeric">${fmtNumber(row.downloads)}</td>
                  <td class="numeric">${fmtDate(row.published_at)}</td>
                </tr>`).join("") : '<tr><td colspan="3" style="color:var(--muted)">No downloads recorded yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

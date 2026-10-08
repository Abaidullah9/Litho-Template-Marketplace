import {
  escapeHtml,
  fmtNumber,
  get,
  mountAdmin,
  requireSession,
} from "./admin.js";

const shell = mountAdmin({
  active: "analytics",
  title: "Analytics",
  crumb: "Admin / Insights / Analytics",
  actions: `
    <div class="field">
      <label for="range" class="sr-only">Range</label>
      <select id="range">
        <option value="7">Last 7 days</option>
        <option value="30" selected>Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>`,
});

await requireSession();

shell.body.innerHTML = '<div class="empty"><h3>Loading analytics…</h3></div>';

const rangeSelect = document.getElementById("range");
rangeSelect.addEventListener("change", () => load(rangeSelect.value));

await load(rangeSelect.value);

async function load(days) {
  shell.body.innerHTML = '<div class="empty"><h3>Loading analytics…</h3></div>';
  try {
    const data = await get(`/api/admin/analytics?days=${encodeURIComponent(days)}`);
    render(data);
  } catch (error) {
    shell.body.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

function render(data) {
  const peak = Math.max(1, ...data.daily.map((day) => Math.max(day.views, day.downloads)));
  const bars = data.daily.map((day) => `
    <div class="bar" title="${escapeHtml(day.date)} — ${day.views} views, ${day.downloads} downloads">
      <span class="downloads" style="height:${(day.downloads / peak) * 100}%"></span>
      <span style="height:${(day.views / peak) * 100}%"></span>
    </div>`).join("");

  shell.body.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card accent">
        <span class="stat-label">Total views</span>
        <span class="stat-value">${fmtNumber(data.totals.views)}</span>
        <span class="stat-note">all time</span>
      </div>
      <div class="stat-card accent">
        <span class="stat-label">Total downloads</span>
        <span class="stat-value">${fmtNumber(data.totals.downloads)}</span>
        <span class="stat-note">all time</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Events in range</span>
        <span class="stat-value">${fmtNumber(data.eventsRecorded)}</span>
        <span class="stat-note">last ${data.range.days} days</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Published templates</span>
        <span class="stat-value">${fmtNumber(data.templates.published)}</span>
        <span class="stat-note">of ${fmtNumber(data.templates.total)} total</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Views per template</span>
        <span class="stat-value">${fmtNumber(Math.round(data.totals.views / Math.max(1, data.templates.published)))}</span>
        <span class="stat-note">average</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Downloads per template</span>
        <span class="stat-value">${fmtNumber(Math.round(data.totals.downloads / Math.max(1, data.templates.published)))}</span>
        <span class="stat-note">average</span>
      </div>
    </div>

    <section class="panel">
      <div class="panel-head">
        <h2>Daily activity</h2>
        <span class="field-hint">${data.range.days} days</span>
      </div>
      <div class="panel-body">
        <div class="bar-chart" role="img" aria-label="Daily views and downloads for the last ${data.range.days} days">${bars}</div>
        <div class="chart-legend">
          <span><i style="background:var(--accent)"></i>Views</span>
          <span><i style="background:#68d6e8"></i>Downloads</span>
        </div>
      </div>
    </section>

    <div class="grid-2">
      <section class="panel">
        <div class="panel-head"><h2>Most viewed templates</h2></div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Template</th><th>Status</th><th class="numeric">Views</th></tr></thead>
            <tbody>
              ${data.topViewed.length ? data.topViewed.map((row) => `
                <tr>
                  <td><a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
                    <span class="row-sub">${escapeHtml(row.slug)}</span></td>
                  <td><span class="badge ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td>
                  <td class="numeric">${fmtNumber(row.views)}</td>
                </tr>`).join("") : '<tr><td colspan="3" style="color:var(--muted)">No data yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><h2>Most downloaded templates</h2></div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Template</th><th>Status</th><th class="numeric">Downloads</th></tr></thead>
            <tbody>
              ${data.topDownloaded.length ? data.topDownloaded.map((row) => `
                <tr>
                  <td><a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(row.id)}">${escapeHtml(row.name)}</a>
                    <span class="row-sub">${escapeHtml(row.slug)}</span></td>
                  <td><span class="badge ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td>
                  <td class="numeric">${fmtNumber(row.downloads)}</td>
                </tr>`).join("") : '<tr><td colspan="3" style="color:var(--muted)">No data yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

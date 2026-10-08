import {
  escapeHtml,
  fmtDateTime,
  fmtNumber,
  get,
  mountAdmin,
  post,
  requireSession,
  toast,
} from "./admin.js";

const shell = mountAdmin({
  active: "registry",
  title: "Registry",
  crumb: "Admin / Insights / Registry",
  actions: '<button class="btn primary" type="button" id="generate">Generate registry</button>',
});

await requireSession();

shell.body.innerHTML = `
  <div class="notice">
    The marketplace catalog registry is generated from published templates. Regenerate below to publish catalog updates.
  </div>
  <div id="registry-status"><div class="empty"><h3>Reading registry…</h3></div></div>
`;

const statusHost = document.getElementById("registry-status");

async function load() {
  try {
    const registry = await get("/api/registry");
    render(registry, null);
  } catch (error) {
    render(null, error);
  }
}

function render(registry, error) {
  if (error) {
    statusHost.innerHTML = `
      <section class="panel">
        <div class="panel-head"><h2>No registry generated yet</h2></div>
        <div class="panel-body">
          <p style="margin-top:0;line-height:1.7;font-size:13px;color:var(--muted)">
            ${escapeHtml(error.message)}
          </p>
          <div class="btn-row">
            <button class="btn primary" type="button" id="generate-inline">Generate now</button>
            <a class="btn ghost" href="https://supabase.com/docs" target="_blank" rel="noreferrer">Registry docs →</a>
          </div>
        </div>
      </section>`;
    document.getElementById("generate-inline").addEventListener("click", generate);
    return;
  }

  statusHost.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card accent">
        <span class="stat-label">Templates</span>
        <span class="stat-value">${fmtNumber(registry.counts.templates)}</span>
        <span class="stat-note">${fmtNumber(registry.counts.verified)} verified · ${fmtNumber(registry.counts.featured)} featured</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Categories</span>
        <span class="stat-value">${fmtNumber(registry.counts.categories)}</span>
        <span class="stat-note">filter bar</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Tags</span>
        <span class="stat-value">${fmtNumber(registry.counts.tags)}</span>
        <span class="stat-note">chips</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Publishers</span>
        <span class="stat-value">${fmtNumber(registry.counts.publishers)}</span>
        <span class="stat-note">authors</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Views</span>
        <span class="stat-value">${fmtNumber(registry.counts.views)}</span>
        <span class="stat-note">snapshot total</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Downloads</span>
        <span class="stat-value">${fmtNumber(registry.counts.downloads)}</span>
        <span class="stat-note">snapshot total</span>
      </div>
    </div>

    <section class="panel">
      <div class="panel-head">
        <h2>Generated snapshot</h2>
        <a class="btn ghost small" href="/api/registry" target="_blank" rel="noreferrer">Open registry.json ↗</a>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field"><label>File</label><div class="field-hint">site/registry.json</div></div>
          <div class="field"><label>Schema</label><div class="field-hint">v${escapeHtml(String(registry.schemaVersion))} · ${escapeHtml(registry.kind)}</div></div>
          <div class="field"><label>Generated</label><div class="field-hint">${fmtDateTime(registry.generatedAt)}</div></div>
          <div class="field"><label>Public endpoint</label><div class="field-hint">GET /api/registry</div></div>
        </div>
        <div class="form-actions" style="margin-top:14px">
          <button class="btn primary" type="button" id="generate-panel">Regenerate from Supabase</button>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Latest entries</h2><span class="field-hint">${fmtNumber(registry.templates.length)} published templates</span></div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Template</th><th>Category</th><th>Publisher</th><th>Tags</th><th class="numeric">Views</th><th class="numeric">Downloads</th></tr></thead>
          <tbody>
            ${registry.templates.slice(0, 15).map((entry) => `
              <tr>
                <td><a class="row-title" href="/template?id=${encodeURIComponent(entry.slug)}">${escapeHtml(entry.name)}</a>
                  <span class="row-sub">${escapeHtml(entry.slug)}</span></td>
                <td>${escapeHtml(entry.category?.name || "—")}</td>
                <td>${escapeHtml(entry.publisher?.name || "—")}</td>
                <td>${entry.tags.slice(0, 3).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}</td>
                <td class="numeric">${fmtNumber(entry.views)}</td>
                <td class="numeric">${fmtNumber(entry.downloads)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("generate-panel").addEventListener("click", generate);
}

async function generate() {
  const button = document.getElementById("generate") || document.getElementById("generate-panel");
  if (button) button.disabled = true;
  try {
    const result = await post("/api/admin/registry/generate", {});
    toast(`Registry generated — ${result.counts.templates} templates`, "success");
    await load();
  } catch (error) {
    toast(error.message, "error");
    if (error.details?.problems) {
      statusHost.innerHTML = `<div class="notice error"><strong>Validation failed</strong><br>${error.details.problems.map(escapeHtml).join("<br>")}</div>`;
    }
  } finally {
    const current = document.getElementById("generate");
    if (current) current.disabled = false;
  }
}

document.getElementById("generate").addEventListener("click", generate);

await load();

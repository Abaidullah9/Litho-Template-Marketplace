import {
  escapeHtml,
  fmtDateTime,
  get,
  mountAdmin,
  requireSession,
  put,
  toast,
} from "./admin.js";

const shell = mountAdmin({
  active: "settings",
  title: "Settings",
  crumb: "Admin / System / Settings",
});

await requireSession();

shell.body.innerHTML = `
  <div class="notice">
    Configure marketplace settings and preferences. Application secrets are managed securely and never exposed.
  </div>
  <div id="service-status"></div>
  <section class="panel">
    <div class="panel-head">
      <h2>Stored settings</h2>
      <button class="btn primary" type="button" id="add-setting">+ Add setting</button>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th style="width:220px">Key</th><th>Value (JSON or plain text)</th><th></th></tr></thead>
        <tbody id="settings-body"></tbody>
      </table>
    </div>
    <div class="empty" id="settings-empty" hidden>
      <h3>No settings stored</h3>
      <p>Add a key to start — for example <code>marketplace.tagline</code>.</p>
    </div>
  </section>
`;

const body = document.getElementById("settings-body");
const empty = document.getElementById("settings-empty");

get("/api/health").then((health) => {
  document.getElementById("service-status").innerHTML = `
    <div class="stat-grid">
      <div class="stat-card ${health.supabase ? "accent" : ""}">
        <span class="stat-label">Supabase</span>
        <span class="stat-value" style="font-size:15px">${health.supabase ? "connected" : "not configured"}</span>
        <span class="stat-note">source of truth</span>
      </div>
      <div class="stat-card ${health.admin ? "accent" : ""}">
        <span class="stat-label">Admin auth</span>
        <span class="stat-value" style="font-size:15px">${health.admin ? "configured" : "not configured"}</span>
        <span class="stat-note">ADMIN_PASSWORD</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Server time</span>
        <span class="stat-value" style="font-size:15px">${fmtDateTime(health.time)}</span>
        <span class="stat-note">${escapeHtml(health.status)}</span>
      </div>
    </div>`;
}).catch(() => {});

async function load() {
  try {
    const settings = await get("/api/admin/settings");
    const entries = Object.entries(settings);
    if (!entries.length) {
      body.innerHTML = "";
      empty.hidden = false;
      return;
    }
    body.innerHTML = entries.map(([key, value]) => `
      <tr data-key="${escapeHtml(key)}">
        <td style="font-family:var(--mono);font-size:11px">${escapeHtml(key)}</td>
        <td><textarea rows="2" name="value">${escapeHtml(JSON.stringify(value, null, 2))}</textarea></td>
        <td class="actions">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn small" type="button" data-save>Save</button>
            <button class="btn ghost small" type="button" data-clear>Clear</button>
          </div>
        </td>
      </tr>`).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="3" style="color:#f18c75;padding:24px">${escapeHtml(error.message)}</td></tr>`;
  }
}

function parseValue(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

body.addEventListener("click", async (event) => {
  const row = event.target.closest("tr[data-key]");
  if (!row) return;
  const key = row.dataset.key;

  if (event.target.closest("[data-save]")) {
    const value = parseValue(row.querySelector("textarea").value);
    try {
      await put("/api/admin/settings", { [key]: value });
      toast(`Saved ${key}`, "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  if (event.target.closest("[data-clear]")) {
    try {
      await put("/api/admin/settings", { [key]: null });
      toast(`Cleared ${key}`, "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

document.getElementById("add-setting").addEventListener("click", async () => {
  const { editModal } = await import("./admin.js");
  const result = await editModal({
    title: "New setting",
    fields: [
      { name: "key", label: "Key", required: true, placeholder: "marketplace.tagline" },
      { name: "value", label: "Value", type: "textarea", placeholder: '{"text":"Discover templates"}' },
    ],
    submitLabel: "Save setting",
    onSubmit: (values) => put("/api/admin/settings", { [values.key.trim()]: parseValue(values.value) }),
  });
  if (result) {
    toast("Setting saved", "success");
    load();
  }
});

await load();

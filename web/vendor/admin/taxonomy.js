import {
  confirmAction,
  del,
  editModal,
  escapeHtml,
  fmtNumber,
  get,
  mountAdmin,
  post,
  put,
  requireSession,
  toast,
} from "./admin.js";

const KINDS = {
  categories: {
    title: "Categories",
    crumb: "Admin / Taxonomy / Categories",
    singular: "category",
    endpoint: "/api/admin/categories",
    intro: "Categories drive the marketplace filter bar. Disable a category to hide it without deleting its templates.",
    fields: (row = {}) => [
      { name: "name", label: "Name", required: true, value: row.name || "", placeholder: "Thesis" },
      { name: "slug", label: "Slug", value: row.slug || "", hint: "Leave empty to derive it from the name." },
      { name: "description", label: "Description", type: "textarea", value: row.description || "", wide: true, placeholder: "What belongs in this category" },
      { name: "sortOrder", label: "Sort order", type: "number", value: row.sort_order ?? 0 },
      { name: "enabled", label: "Availability", type: "checkbox", value: row.enabled ?? true, checkboxLabel: "Visible in the marketplace" },
    ],
    columns: ["Name", "Slug", "Templates", "State", ""],
    cells: (row) => `
      <td><span class="row-title">${escapeHtml(row.name)}</span><span class="row-sub">${escapeHtml(row.description || "")}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${escapeHtml(row.slug)}</td>
      <td class="numeric">${fmtNumber(row.templateCount)}</td>
      <td>${row.enabled ? '<span class="badge published">enabled</span>' : '<span class="badge archived">disabled</span>'}</td>`,
    payload: (values) => ({
      name: values.name,
      slug: values.slug,
      description: values.description,
      sortOrder: Number(values.sortOrder) || 0,
      enabled: Boolean(values.enabled),
    }),
  },
  tags: {
    title: "Tags",
    crumb: "Admin / Taxonomy / Tags",
    singular: "tag",
    endpoint: "/api/admin/tags",
    intro: "Tags are reusable labels shared across templates and surfaced as chips on cards and detail pages.",
    fields: (row = {}) => [
      { name: "name", label: "Name", required: true, value: row.name || "", placeholder: "LaTeX" },
      { name: "slug", label: "Slug", value: row.slug || "", hint: "Leave empty to derive it from the name." },
    ],
    columns: ["Tag", "Slug", "Templates", ""],
    cells: (row) => `
      <td><span class="row-title">${escapeHtml(row.name)}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${escapeHtml(row.slug)}</td>
      <td class="numeric">${fmtNumber(row.templateCount)}</td>`,
    payload: (values) => ({ name: values.name, slug: values.slug }),
  },
  publishers: {
    title: "Publishers",
    crumb: "Admin / Taxonomy / Publishers",
    singular: "publisher",
    endpoint: "/api/admin/publishers",
    intro: "A publisher is the reusable author profile shown on template cards and detail pages.",
    fields: (row = {}) => [
      { name: "name", label: "Name", required: true, value: row.name || "", placeholder: "Template Studio" },
      { name: "slug", label: "Slug", value: row.slug || "", hint: "Leave empty to derive it from the name." },
      { name: "websiteUrl", label: "Website", type: "url", value: row.website_url || "", placeholder: "https://…" },
      { name: "avatarUrl", label: "Avatar URL", type: "url", value: row.avatar_url || "", placeholder: "https://…" },
      { name: "description", label: "About", type: "textarea", value: row.description || "", wide: true },
      { name: "enabled", label: "Availability", type: "checkbox", value: row.enabled ?? true, checkboxLabel: "Visible in the marketplace" },
    ],
    columns: ["Publisher", "Website", "Templates", "State", ""],
    cells: (row) => `
      <td><span class="row-title">${escapeHtml(row.name)}</span><span class="row-sub">${escapeHtml(row.slug)}</span></td>
      <td>${row.website_url ? `<a class="field-hint" href="${escapeHtml(row.website_url)}" target="_blank" rel="noreferrer">${escapeHtml(row.website_url)}</a>` : '<span class="field-hint">—</span>'}</td>
      <td class="numeric">${fmtNumber(row.templateCount)}</td>
      <td>${row.enabled ? '<span class="badge published">enabled</span>' : '<span class="badge archived">disabled</span>'}</td>`,
    payload: (values) => ({
      name: values.name,
      slug: values.slug,
      websiteUrl: values.websiteUrl,
      avatarUrl: values.avatarUrl,
      description: values.description,
      enabled: Boolean(values.enabled),
    }),
  },
};

const kind = location.pathname.replace(/\/$/, "").split("/").pop();
const config = KINDS[kind] || KINDS.categories;

const shell = mountAdmin({
  active: kind,
  title: config.title,
  crumb: config.crumb,
  actions: `<button class="btn primary" type="button" id="create-new">+ New ${config.singular}</button>`,
});

await requireSession();

shell.body.innerHTML = `
  <div class="notice">${escapeHtml(config.intro)}</div>
  <section class="panel">
    <div class="panel-head"><h2>All ${config.title.toLowerCase()}</h2><span class="field-hint" id="row-count"></span></div>
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr>${config.columns.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead>
        <tbody id="taxonomy-body"></tbody>
      </table>
    </div>
    <div class="empty" id="taxonomy-empty" hidden>
      <h3>No ${config.title.toLowerCase()} yet</h3>
      <p>Create the first ${config.singular} to get started.</p>
    </div>
  </section>
`;

const body = document.getElementById("taxonomy-body");
const empty = document.getElementById("taxonomy-empty");

async function load() {
  try {
    const rows = await get(config.endpoint);
    document.getElementById("row-count").textContent = `${rows.length} total`;
    if (!rows.length) {
      body.innerHTML = "";
      empty.hidden = false;
      return;
    }
    body.innerHTML = rows.map((row) => `
      <tr data-id="${escapeHtml(row.id)}">
        ${config.cells(row)}
        <td class="actions">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn small" type="button" data-edit>Edit</button>
            <button class="btn danger small" type="button" data-delete>Delete</button>
          </div>
        </td>
      </tr>`).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="${config.columns.length + 1}" style="color:#f18c75;padding:24px">${escapeHtml(error.message)}</td></tr>`;
  }
}

document.getElementById("create-new").addEventListener("click", async () => {
  const result = await editModal({
    title: `New ${config.singular}`,
    fields: config.fields({}),
    submitLabel: "Create",
    onSubmit: (values) => post(config.endpoint, config.payload(values)),
  });
  if (result) {
    toast(`${config.singular} created`, "success");
    load();
  }
});

body.addEventListener("click", async (event) => {
  const row = event.target.closest("tr[data-id]");
  if (!row) return;
  const id = row.dataset.id;

  if (event.target.closest("[data-edit]")) {
    const current = await get(`${config.endpoint}`).then((rows) => rows.find((item) => item.id === id));
    if (!current) return toast("Row not found", "error");
    const result = await editModal({
      title: `Edit ${config.singular}`,
      fields: config.fields(current),
      submitLabel: "Save",
      onSubmit: (values) => put(`${config.endpoint}/${encodeURIComponent(id)}`, config.payload(values)),
    });
    if (result) {
      toast(`${config.singular} updated`, "success");
      load();
    }
  }

  if (event.target.closest("[data-delete]")) {
    const ok = await confirmAction(`Delete this ${config.singular}? Templates keep existing; their ${config.singular} link is removed.`, { confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await del(`${config.endpoint}/${encodeURIComponent(id)}`);
      toast(`${config.singular} deleted`, "success");
      load();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

await load();

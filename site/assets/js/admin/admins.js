import {
  confirmAction,
  del,
  editModal,
  escapeHtml,
  fmtDateTime,
  get,
  mountAdmin,
  post,
  requireSession,
  toast,
} from "./admin.js";

const shell = mountAdmin({
  active: "admins",
  title: "Admin users",
  crumb: "Admin / System / Admins",
});

const session = await requireSession();
const currentUsername = (session?.username || "admin").toLowerCase();

shell.body.innerHTML = `
  <div class="notice">
    Manage administrators with access to the marketplace console.
  </div>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Team administrators</h2>
        <span class="field-hint">Users with access to templates, submissions, and taxonomy</span>
      </div>
      <button class="btn primary" type="button" id="add-admin">+ New admin</button>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:200px">Username</th>
            <th style="width:120px">Role</th>
            <th style="width:180px">Created</th>
            <th style="width:180px">Last updated</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody id="admins-body">
          <tr><td colspan="5" style="color:var(--muted);padding:24px">Loading admins…</td></tr>
        </tbody>
      </table>
    </div>
    <div class="empty" id="admins-empty" hidden>
      <h3>No administrators found</h3>
      <p>Click "+ New admin" to create an administrator account.</p>
    </div>
  </section>
`;

const body = document.getElementById("admins-body");
const empty = document.getElementById("admins-empty");

async function load() {
  try {
    const users = await get("/api/admin/admins");
    if (!Array.isArray(users) || !users.length) {
      body.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    body.innerHTML = users.map((user) => {
      const isSelf = user.username.toLowerCase() === currentUsername;
      const youBadge = isSelf ? ' <span class="badge" style="font-size:10px;text-transform:uppercase">You</span>' : "";
      return `
        <tr data-id="${escapeHtml(user.id)}" data-username="${escapeHtml(user.username)}">
          <td style="font-family:var(--mono);font-size:13px;font-weight:600">
            ${escapeHtml(user.username)}${youBadge}
          </td>
          <td><span class="badge ${user.role === "admin" ? "featured" : ""}">${escapeHtml(user.role || "admin")}</span></td>
          <td style="font-size:12px;color:var(--muted)">${fmtDateTime(user.created_at)}</td>
          <td style="font-size:12px;color:var(--muted)">${fmtDateTime(user.updated_at)}</td>
          <td class="actions">
            <div class="btn-row" style="justify-content:flex-end">
              ${isSelf
                ? '<span style="font-size:11px;color:var(--muted)">Active session</span>'
                : '<button class="btn danger small" type="button" data-delete>Delete</button>'
              }
            </div>
          </td>
        </tr>`;
    }).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="5" style="color:#f18c75;padding:24px">${escapeHtml(error.message)}</td></tr>`;
  }
}

body.addEventListener("click", async (event) => {
  const row = event.target.closest("tr[data-id]");
  if (!row) return;
  const id = row.dataset.id;
  const username = row.dataset.username;

  if (event.target.closest("[data-delete]")) {
    const confirmed = await confirmAction(
      `Are you sure you want to revoke admin access for "${username}"? This cannot be undone.`,
      { confirmLabel: "Delete admin" },
    );
    if (!confirmed) return;

    try {
      await del(`/api/admin/admins/${encodeURIComponent(id)}`);
      toast(`Deleted admin user "${username}"`, "success");
      await load();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

document.getElementById("add-admin").addEventListener("click", async () => {
  const result = await editModal({
    title: "Create new administrator",
    fields: [
      {
        name: "username",
        label: "Username",
        required: true,
        placeholder: "e.g. sarah_admin",
        hint: "3 to 32 characters (letters, numbers, underscores, dots, or dashes).",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        placeholder: "••••••••••••",
        hint: "At least 8 characters.",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        value: "admin",
        options: [
          { value: "admin", label: "Admin (Full access)" },
          { value: "editor", label: "Editor (Content management)" },
          { value: "viewer", label: "Viewer (Read-only access)" },
        ],
      },
    ],
    submitLabel: "Create admin",
    onSubmit: async (values) => {
      return post("/api/admin/admins", {
        username: values.username.trim(),
        password: values.password,
        role: values.role,
      });
    },
  });

  if (result) {
    toast(`Admin "${result.username}" created successfully`, "success");
    await load();
  }
});

await load();

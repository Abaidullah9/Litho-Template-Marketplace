import { api, showFormErrors } from "./admin.js";

const form = document.getElementById("login-form");
const message = document.getElementById("login-message");

// Already signed in? Go straight to the dashboard.
api("/api/admin/session")
  .then(() => { window.location.href = "/admin"; })
  .catch(() => { /* not signed in yet */ });

if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
  const hint = document.createElement("div");
  hint.className = "login-host-notice";
  hint.style.cssText = "margin-bottom: 16px; font-size: 13px; line-height: 1.5; padding: 12px 14px; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted);";
  hint.innerHTML = `<strong style="color:var(--text);display:block;margin-bottom:4px;">Static Preview Host</strong>GitHub Pages hosts the public static catalog only. Admin authentication and management require the Node.js backend server. To access the admin panel, run <code>node scripts/start.js</code> and open <a href="http://localhost:8787/admin" style="color:var(--accent);text-decoration:underline;">http://localhost:8787/admin</a>.`;
  form.prepend(hint);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormErrors(form);
  message.textContent = "";
  const username = form.username ? form.username.value.trim() : "";
  const password = form.password.value;
  try {
    await api("/api/admin/login", { method: "POST", body: { username, password } });
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/admin") ? next : "/admin";
  } catch (error) {
    showFormErrors(form, error.details || { password: error.message });
    message.textContent = error.message;
    if (form.username && !form.username.value) {
      form.username.focus();
    } else {
      form.password.focus();
      form.password.select();
    }
  }
});

import { api, showFormErrors } from "./admin.js";

const form = document.getElementById("login-form");
const message = document.getElementById("login-message");

// Already signed in? Go straight to the dashboard.
api("/api/admin/session")
  .then(() => { window.location.href = "/admin"; })
  .catch(() => { /* not signed in yet */ });

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

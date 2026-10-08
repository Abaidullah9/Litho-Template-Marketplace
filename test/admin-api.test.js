import test from "node:test";
import assert from "node:assert/strict";

import { loadConfig } from "../server/config.js";
import { createApp } from "../server/app.js";
import { createActivityLog } from "../server/services/activity.js";

const ADMIN_PASSWORD = "correct-horse-battery-stapler";
const ADMIN_SESSION_SECRET = "test-session-secret-0123456789abcdef";

function unconfiguredConfig() {
  return loadConfig({
    PORT: "0",
    HOST: "127.0.0.1",
    ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET,
    NODE_ENV: "test",
  });
}

test("admin API fails closed with JSON errors while Supabase is unconfigured", async (t) => {
  const config = unconfiguredConfig();
  assert.equal(config.supabaseConfigured, false, "supabase stays unconfigured");
  assert.equal(config.adminConfigured, true, "admin credentials are configured");

  const app = createApp({ config, supabase: () => null });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const unauthenticated = await fetch(`${base}/api/admin/dashboard`);
  assert.equal(unauthenticated.status, 401);

  const badLogin = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: "wrong-password-123" }),
  });
  assert.equal(badLogin.status, 403);

  // Login must succeed without Supabase: the activity write is best-effort and
  // must never crash the process (regression: an un-awaited rejection killed it).
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  assert.equal(login.status, 200);
  const cookie = (login.headers.get("set-cookie") || "").split(";")[0];
  assert.match(cookie, /^tmp_admin_session=/);

  const authed = await fetch(`${base}/api/admin/dashboard`, { headers: { cookie } });
  assert.equal(authed.status, 503);
  const body = await authed.json();
  assert.equal(body.error.code, "not_configured");

  // The server must still be alive after every path above.
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.deepEqual(
    { status: healthBody.status, supabase: healthBody.supabase, admin: healthBody.admin },
    { status: "ok", supabase: false, admin: true },
  );

  const templates = await fetch(`${base}/api/templates`);
  assert.equal(templates.status, 503);
});

test("the homepage admin entry leads to a sign-in page this server serves", async (t) => {
  const app = createApp({ config: unconfiguredConfig(), supabase: () => null });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200);
  const html = await home.text();
  const entry = html.match(/<a class="market-admin-entry" href="([^"]+)" aria-label="Sign in to the admin dashboard"[^>]*>/);
  assert.ok(entry, "homepage carries an admin entry point");
  const [, href] = entry;

  // The link target has to be a route this server actually serves, not just a plausible URL.
  const login = await fetch(`${base}${href}`);
  assert.equal(login.status, 200);
  assert.match(login.headers.get("content-type") || "", /text\/html/);
  const loginHtml = await login.text();
  assert.match(loginHtml, /<title>Sign in \| Template Marketplace Admin<\/title>/);
  assert.match(loginHtml, /id="login-form"/);
  assert.match(loginHtml, /id="username"/);
  assert.match(loginHtml, /name="username"/);
  assert.match(loginHtml, /id="password"/);
  assert.match(loginHtml, /name="password"/);
  assert.match(loginHtml, /autocomplete="current-password"/i);
  assert.match(loginHtml, /required(?:=""|(?=[\s>]))/);
  // The sign-in card wears the marketplace brand, and the brand links back to the marketplace.
  assert.match(
    loginHtml,
    /<a class="login-brand" href="\/index\.html" aria-label="Template Marketplace home">[\s\S]*litho-wordmark\.png\?v=20261007-01[\s\S]*<span>TEMPLATE MARKETPLACE<\/span><\/a>/,
  );

  // …and the dashboard the sign-in page continues to, plus the assets both pages rely on.
  const dashboard = await fetch(`${base}/admin`);
  assert.equal(dashboard.status, 200);
  assert.match(await dashboard.text(), /<title>Dashboard \| Template Marketplace Admin<\/title>/);
  for (const asset of ["/assets/js/admin/login.js", "/assets/js/admin/dashboard.js", "/assets/css/admin.css"]) {
    assert.equal((await fetch(`${base}${asset}`)).status, 200, `${asset} is served`);
  }
});

/**
 * Regression: the sign-in page probes /api/admin/session to skip the form for a live session, and
 * that probe is a 401 for everyone who still has to sign in. Redirecting those 401s "back" to the
 * page that asked for them reloads the document forever, which is what made the password field
 * impossible to use.
 */
test("a 401 on the sign-in page does not send the page back to itself", async () => {
  const navigations = [];
  const location = {
    pathname: "/admin/login",
    origin: "http://127.0.0.1:8787",
    set href(value) {
      navigations.push(value);
    },
    get href() {
      return `http://127.0.0.1:8787${this.pathname}`;
    },
  };
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  globalThis.window = { location };
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { code: "unauthorized", message: "Sign in required." } }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });

  try {
    const { api, ApiError } = await import("../site/assets/js/admin/admin.js");

    await assert.rejects(
      () => api("/api/admin/session"),
      (error) => error instanceof ApiError && error.status === 401,
      "the probe still reports failure to its caller",
    );
    assert.deepEqual(navigations, [], "the sign-in page must not reload itself");

    // A protected page is unaffected: it redirects once, and carries the page to return to.
    location.pathname = "/admin/templates";
    await assert.rejects(() => api("/api/admin/session"), (error) => error instanceof ApiError);
    assert.deepEqual(navigations, ["/admin/login?next=%2Fadmin%2Ftemplates"]);

    // The login POST itself never redirects either, whatever page it is sent from.
    location.pathname = "/admin/templates";
    await assert.rejects(() => api("/api/admin/login", { method: "POST", body: { password: "x" } }));
    assert.deepEqual(navigations, ["/admin/login?next=%2Fadmin%2Ftemplates"]);
  } finally {
    globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
  }
});

test("activity log never rejects when the Supabase client is missing", async () => {
  const errors = [];
  const log = createActivityLog(null, { onError: (...args) => errors.push(args) });
  assert.equal(await log.record({ action: "admin.login", entity: "admin" }), false);
  assert.equal(errors.length, 1);
  assert.match(String(errors[0][0]), /activity log write skipped/);
});

test("admin API enforces CSRF protection against cross-origin mutations", async (t) => {
  const config = unconfiguredConfig();
  const app = createApp({ config, supabase: () => null });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const originBlocked = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://malicious-site.example",
    },
    body: JSON.stringify({ username: "admin", password: ADMIN_PASSWORD }),
  });
  assert.equal(originBlocked.status, 403);
  const originBody = await originBlocked.json();
  assert.equal(originBody.error.code, "forbidden");
  assert.match(originBody.error.message, /CSRF/);

  const refererBlocked = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      referer: "https://evil-site.com/exploit.html",
    },
    body: JSON.stringify({ username: "admin", password: ADMIN_PASSWORD }),
  });
  assert.equal(refererBlocked.status, 403);
  const refererBody = await refererBlocked.json();
  assert.equal(refererBody.error.code, "forbidden");
  assert.match(refererBody.error.message, /CSRF/);
});

test("/admin/admins page is served and admin assets are present", async (t) => {
  const app = createApp({ config: unconfiguredConfig(), supabase: () => null });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const res = await fetch(`${base}/admin/admins`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type") || "", /text\/html/);
  const html = await res.text();
  assert.match(html, /<title>Admins \| Template Marketplace Admin<\/title>/);
});

test("admin-users model enforces validation, scrypt hashing, and lockout guards", async () => {
  const { createAdminUser, deleteAdminUser, listAdminUsers } = await import("../server/models/admin-users.js");

  let store = [
    { id: "1", username: "admin", role: "admin", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z", password_hash: "scrypt:salt:hash" },
  ];

  const mockClient = {
    from(table) {
      if (table !== "admin_users") throw new Error("unknown table");
      let filtered = [...store];
      return {
        select(cols, opts = {}) {
          if (opts.count === "exact" && opts.head) {
            return Promise.resolve({ count: store.length, error: null });
          }
          return this;
        },
        order() {
          return Promise.resolve({ data: store.map((u) => ({ id: u.id, username: u.username, role: u.role })), error: null });
        },
        eq(col, val) {
          filtered = filtered.filter((u) => u[col] === val);
          return this;
        },
        async maybeSingle() {
          return { data: filtered[0] || null, error: null };
        },
        insert(row) {
          const inserted = { id: String(store.length + 1), ...row, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          store.push(inserted);
          return {
            select() {
              return {
                maybeSingle: async () => ({ data: inserted, error: null }),
              };
            },
          };
        },
        delete() {
          return {
            eq(col, val) {
              store = store.filter((u) => u[col] !== val);
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  };

  // Rejects invalid usernames
  await assert.rejects(() => createAdminUser(mockClient, { username: "a", password: "password123" }), /Username must be/);
  await assert.rejects(() => createAdminUser(mockClient, { username: "<script>", password: "password123" }), /Username must be/);

  // Rejects short passwords (< 8 characters)
  await assert.rejects(() => createAdminUser(mockClient, { username: "sarah", password: "123" }), /Password must be at least 8/);

  // Rejects duplicate username
  await assert.rejects(() => createAdminUser(mockClient, { username: "admin", password: "password123" }), /already exists/);

  // Creates valid admin with scrypt hash
  const created = await createAdminUser(mockClient, { username: "sarah_admin", password: "secure-password-456", role: "editor" });
  assert.equal(created.username, "sarah_admin");
  assert.equal(created.role, "editor");
  assert.equal("password_hash" in created, false, "password_hash is excluded from return value");

  // Listing users never exposes password hashes
  const users = await listAdminUsers(mockClient);
  assert.equal(users.length, 2);
  for (const u of users) {
    assert.equal("password_hash" in u, false, "password_hash must never be leaked");
  }

  // Prevents self-deletion
  await assert.rejects(
    () => deleteAdminUser(mockClient, "1", "admin", "admin"),
    /You cannot delete your own admin account/,
  );

  // Prevents deleting primary admin defined in .env
  await assert.rejects(
    () => deleteAdminUser(mockClient, "1", "sarah_admin", "admin"),
    /primary admin account defined in \.env cannot be deleted/,
  );

  // Allows deleting secondary admin
  const delResult = await deleteAdminUser(mockClient, "2", "admin", "admin");
  assert.equal(delResult.ok, true);
  assert.equal(store.length, 1);

  // Prevents deleting the last remaining admin
  await assert.rejects(
    () => deleteAdminUser(mockClient, "1", "someone_else", "different_admin"),
    /Cannot delete the only remaining admin account/,
  );
});



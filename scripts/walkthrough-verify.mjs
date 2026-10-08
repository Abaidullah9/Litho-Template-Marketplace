const BASE = "http://localhost:8787";
let cookie = "";

async function api(method, path, body, isForm = false) {
  const headers = { cookie };
  let payload;
  if (body) {
    if (isForm) {
      payload = new URLSearchParams(body).toString();
      headers["content-type"] = "application/x-www-form-urlencoded";
    } else {
      headers["content-type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  const res = await fetch(BASE + path, { method, headers, body: payload, redirect: "manual" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}

const log = (label, r) =>
  console.log(`${label}: ${r.status}`, r.json ? JSON.stringify(r.json).slice(0, 220) : r.text.slice(0, 160));

// 1. login
const login = await api("POST", "/api/admin/login", { password: process.env.ADMIN_PASSWORD });
log("login", login);
if (login.status !== 200) process.exit(1);

// 2. create template
const created = await api("POST", "/api/admin/templates", {
  name: "CRUD Walkthrough Template",
  slug: "crud-walkthrough-template",
  status: "published",
  description: "Temporary template created to verify admin CRUD.",
  downloadUrl: "https://example.com/crud-walkthrough.zip",
  tags: ["walkthrough"],
});
log("create-template", created);
const templateId = created.json?.id;

// 3. update template
if (templateId) {
  const updated = await api("PUT", `/api/admin/templates/${templateId}`, {
    name: "CRUD Walkthrough Template (edited)",
    slug: "crud-walkthrough-template",
    status: "published",
    description: "Edited description to verify admin update.",
    downloadUrl: "https://example.com/crud-walkthrough-v2.zip",
    tags: ["walkthrough", "edited"],
  });
  log("update-template", updated);

  // 4. delete template
  const deleted = await api("DELETE", `/api/admin/templates/${templateId}`);
  log("delete-template", deleted);
}

// 5. public submission
const submission = await api("POST", "/api/submissions", {
  name: "Reject Walkthrough Template",
  description: "Temporary submission created to verify the reject path.",
  submitterName: "Walkthrough Bot",
  submitterEmail: "walkthrough@example.com",
  publisherName: "Walkthrough Publisher",
  downloadUrl: "https://example.com/reject-walkthrough.zip",
  tags: ["walkthrough"],
});
log("public-submission", submission);
const submissionId = submission.json?.id;

// 6. reject it
if (submissionId) {
  const rejected = await api("POST", `/api/admin/submissions/${submissionId}/reject`, {
    reason: "Walkthrough verification — not a real submission.",
  });
  log("reject-submission", rejected);
}

// 7. dashboard counters
const dashboard = await api("GET", "/api/admin/dashboard");
if (dashboard.json) {
  const d = dashboard.json;
  console.log("dashboard:", JSON.stringify({
    templates: d.counts?.templates ?? d.templates,
    submissions: d.counts?.submissions ?? d.submissions,
    analyticsEvents: d.counts?.analyticsEvents ?? d.analyticsEvents,
    topViewed: (d.topViewed || [])[0] || null,
    topDownloaded: (d.topDownloaded || [])[0] || null,
  }));
} else {
  log("dashboard", dashboard);
}

// 8. submissions list reflects rejected status
const subs = await api("GET", "/api/admin/submissions?status=rejected");
const rejectedList = subs.json?.items || subs.json || [];
const ourReject = (Array.isArray(rejectedList) ? rejectedList : []).find((s) => s.name === "Reject Walkthrough Template");
console.log("rejected-submission-in-list:", ourReject ? `yes (status=${ourReject.status}, reason=${ourReject.reject_reason})` : "NOT FOUND");

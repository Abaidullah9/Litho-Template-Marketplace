import { badRequest, conflict, forbidden, notFound, unconfigured, upstream } from "../errors.js";
import {
  SUBMISSION_STATUSES,
  slugify,
  validateCategory,
  validatePublisher,
  validateTag,
  validateTemplate,
} from "../validation.js";
import { clearSessionCookie, createSessionToken, sessionCookie } from "../auth.js";
import { uploadedPath } from "../uploads.js";
import { createActivityLog } from "../services/activity.js";
import { ManualVerificationProvider, VerificationService } from "../services/verification.js";
import { generateRegistry } from "../services/registry.js";
import { intParam } from "../utils/query.js";
import { assertSlugAvailable } from "../models/slugs.js";
import * as templates from "../models/templates.js";
import * as taxonomy from "../models/taxonomy.js";
import * as submissions from "../models/submissions.js";
import { eventsSince } from "../models/analytics.js";
import * as settings from "../models/settings.js";
import * as adminUsers from "../models/admin-users.js";
import * as view from "../views/admin-view.js";

function cryptoSafeEqual(left, right) {
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

/** Constant-time compare so a wrong password cannot be timed byte by byte. */
function equalSecrets(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return cryptoSafeEqual(left, right);
}

/** Apply uploaded files to a validated payload (URL fields take the file path). */
function withUploads(req, payload) {
  const files = req.files || {};
  const preview = uploadedPath(files.previewImage?.[0]);
  const sample = uploadedPath(files.sampleFile?.[0]);
  if (preview) payload.previewImage = preview;
  if (sample) payload.sampleFile = sample;
  return payload;
}

/**
 * A submission may name a publisher the marketplace has never seen. On
 * approval we reuse an existing publisher with the same slug or create one —
 * the admin approved that mapping by approving the submission.
 */
async function resolvePublisher(client, submission) {
  if (submission.publisher_id) return submission.publisher_id;
  const name = String(submission.publisher_name || "").trim();
  if (!name) return null;
  const slug = slugify(name);
  if (!slug) return null;

  const existing = await taxonomy.findPublisherBySlug(client, slug);
  if (existing) return existing;
  return taxonomy.insertPublisherIfAbsent(client, {
    slug,
    name: name.slice(0, 120),
    description: "",
    enabled: true,
  });
}

const BULK_ACTIONS = {
  publish: (client, ids) => templates.updateMany(client, ids, { status: "published", published_at: new Date().toISOString() }),
  unpublish: (client, ids) => templates.updateMany(client, ids, { status: "draft" }),
  archive: (client, ids) => templates.updateMany(client, ids, { status: "archived" }),
  feature: (client, ids) => templates.updateMany(client, ids, { featured: true }),
  unfeature: (client, ids) => templates.updateMany(client, ids, { featured: false }),
};

const TEMPLATE_ACTIONS = {
  publish: (client, template) => templates.patchOne(client, template.id, {
    status: "published",
    published_at: template.published_at || new Date().toISOString(),
  }),
  unpublish: (client, template) => templates.patchOne(client, template.id, { status: "draft" }),
  archive: (client, template) => templates.patchOne(client, template.id, { status: "archived" }),
  feature: (client, template) => templates.patchOne(client, template.id, { featured: true }),
  unfeature: (client, template) => templates.patchOne(client, template.id, { featured: false }),
};

/**
 * Admin console controller.
 *
 * Handlers parse requests and set status codes; `models/` read and write rows
 * and `views/` shape responses. Verification and activity logging are injected
 * as services so the same flow powers single and bulk actions.
 */
export function createAdminController({ config, supabase }) {
  const activity = {
    record: (entry) => createActivityLog(supabase()).record(entry),
    list: (options) => createActivityLog(supabase()).list(options),
  };
  const verification = {
    verify: (templateId, context) => new VerificationService({
      supabase: supabase(),
      provider: new ManualVerificationProvider(),
      activity,
    }).verify(templateId, context),
    revoke: (templateId, context) => new VerificationService({
      supabase: supabase(),
      provider: new ManualVerificationProvider(),
      activity,
    }).revoke(templateId, context),
  };

  // --------------------------------------------------------------------------
  // Session
  // --------------------------------------------------------------------------
  async function login(req, res) {
    if (!config.adminConfigured) {
      throw unconfigured("Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env first (see .env.example).");
    }
    const username = req.body?.username ? String(req.body.username).trim() : "";
    const password = String(req.body?.password || "");
    if (!password) {
      throw forbidden("Password is required.");
    }

    const client = supabase ? supabase() : null;
    const user = await adminUsers.authenticateAdmin(client, username, password, config);
    if (!user) {
      throw forbidden("Incorrect admin username or password.");
    }

    const { token, expiresAt } = createSessionToken(config.adminSessionSecret, config.sessionTtlSeconds, user.username);
    res.setHeader("Set-Cookie", sessionCookie(token, expiresAt));
    activity.record({ action: "admin.login", entity: "admin", actor: user.username || "admin", metadata: { expiresAt } });
    res.json({ ok: true, username: user.username, expiresAt: new Date(expiresAt * 1000).toISOString() });
  }

  function logout(req, res) {
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.json({ ok: true });
  }

  function session(req, res) {
    res.json({ authenticated: true, username: req.adminUsername || "admin" });
  }

  // --------------------------------------------------------------------------
  // Dashboard
  // --------------------------------------------------------------------------
  async function dashboard(req, res) {
    const client = supabase();
    const [
      total, published, pendingTemplates, draft, featured, verified, archived,
      categories, tags, publishers, pendingSubmissions, recentTemplates, recentSubmissions,
    ] = await Promise.all([
      templates.count(client),
      templates.count(client, { status: "published" }),
      templates.count(client, { status: "pending" }),
      templates.count(client, { status: "draft" }),
      templates.count(client, { featured: true }),
      templates.count(client, { verified: true }),
      templates.count(client, { status: "archived" }),
      taxonomy.countRows(client, "categories"),
      taxonomy.countRows(client, "tags"),
      taxonomy.countRows(client, "publishers"),
      submissions.countByStatus(client, "pending"),
      templates.recent(client, 6),
      submissions.recentPending(client, 6),
    ]);

    if (recentTemplates.error || recentSubmissions.error) throw upstream();

    const [topViewed, topDownloaded] = await Promise.all([
      templates.topBy(client, "views", 5),
      templates.topBy(client, "downloads", 5),
    ]);
    if (topViewed.error || topDownloaded.error) throw upstream();

    const rows = await templates.statTotals(client);
    const sum = (field) => rows.reduce((totalValue, row) => totalValue + Number(row[field] || 0), 0);

    res.json(view.dashboard({
      counts: {
        templates: total,
        published,
        pending: pendingSubmissions,
        pendingTemplates,
        draft,
        archived,
        featured,
        verified,
        views: sum("views"),
        downloads: sum("downloads"),
        categories,
        tags,
        publishers,
      },
      recentTemplates: recentTemplates.data || [],
      recentSubmissions: recentSubmissions.data || [],
      topViewed: topViewed.data || [],
      topDownloaded: topDownloaded.data || [],
    }));
  }

  // --------------------------------------------------------------------------
  // Templates
  // --------------------------------------------------------------------------
  async function listTemplates(req, res) {
    const client = supabase();
    const page = intParam(req.query.page, 1, { min: 1, max: 10_000 });
    const perPage = intParam(req.query.perPage, 20, { min: 1, max: 100 });
    const {
      q = "", status = "", category = "", publisher = "",
      verified = "", featured = "",
    } = req.query;

    let categoryId = null;
    if (category) {
      categoryId = await taxonomy.resolveId(client, "categories", category);
      if (!categoryId) return res.json(view.paged([], { total: 0, page, perPage }));
    }
    let publisherId = null;
    if (publisher) {
      publisherId = await taxonomy.resolveId(client, "publishers", publisher);
      if (!publisherId) return res.json(view.paged([], { total: 0, page, perPage }));
    }

    const { rows, total } = await templates.listAdmin(client, {
      q, status, categoryId, publisherId, verified, featured,
      sort: req.query.sort, page, perPage,
    });

    const [categories, publishers, tags, links] = await Promise.all([
      taxonomy.categoryOptions(client),
      taxonomy.publisherOptions(client),
      taxonomy.tagOptions(client),
      client.from("template_tags").select("template_id, tag_id").in("template_id", rows.map((row) => row.id)),
    ]);
    if (categories.error || publishers.error || tags.error || links.error) throw upstream();

    const lookups = templates.lookupMaps(
      categories.data || [],
      publishers.data || [],
      tags.data || [],
      links.data || [],
    );

    res.json(view.paged(
      rows.map((row) => view.templateListItem(row, lookups)),
      { total, page, perPage },
    ));
  }

  async function getOneTemplate(req, res) {
    const client = supabase();
    const row = await templates.findById(client, req.params.id);
    const tagNames = await templates.tagNamesFor(client, row.id);
    res.json({ ...row, tagNames });
  }

  async function createTemplate(req, res) {
    const payload = withUploads(req, validateTemplate(req.body || {}));
    const client = supabase();
    await assertSlugAvailable(client, payload.slug);
    const row = await templates.insert(client, payload);
    await templates.syncTags(client, row.id, payload.tags);
    await activity.record({
      action: "template.created",
      entity: "template",
      entityId: row.id,
      metadata: { slug: row.slug, name: row.name, status: row.status },
    });
    res.status(201).json(row);
  }

  async function updateTemplate(req, res) {
    const client = supabase();
    const existing = await templates.findById(client, req.params.id);
    const payload = withUploads(req, validateTemplate(req.body || {}));
    if (payload.slug !== existing.slug) await assertSlugAvailable(client, payload.slug, existing.id);
    const data = await templates.update(client, existing.id, payload, existing);
    await templates.syncTags(client, existing.id, payload.tags);
    await activity.record({
      action: "template.updated",
      entity: "template",
      entityId: existing.id,
      metadata: { slug: data.slug, changed: Object.keys(req.body || {}) },
    });
    res.json({ ...data, tagNames: payload.tags });
  }

  async function deleteTemplate(req, res) {
    const client = supabase();
    const existing = await templates.findById(client, req.params.id);
    await templates.remove(client, existing.id);
    await activity.record({
      action: "template.deleted",
      entity: "template",
      entityId: existing.id,
      metadata: { slug: existing.slug, name: existing.name },
    });
    res.json({ ok: true, id: existing.id, slug: existing.slug });
  }

  async function bulkTemplates(req, res) {
    const action = String(req.body?.action || "");
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.filter((value) => typeof value === "string")
      : [];
    if (!ids.length) throw badRequest("Select at least one template.");
    const client = supabase();

    if (action === "delete") {
      const rows = await templates.deleteMany(client, ids);
      await activity.record({
        action: "template.bulk_deleted",
        entity: "template",
        entityId: ids.join(","),
        metadata: { count: rows.length },
      });
      return res.json({ ok: true, action, count: rows.length });
    }

    if (action === "verify" || action === "unverify") {
      const results = [];
      for (const id of ids) {
        const row = action === "verify"
          ? await verification.verify(id, { actor: "admin", reason: "Bulk verification." })
          : await verification.revoke(id, { actor: "admin", reason: "Bulk unverification." });
        if (row) results.push(row);
      }
      return res.json({ ok: true, action, count: results.length });
    }

    const handler = BULK_ACTIONS[action];
    if (!handler) throw badRequest(`Unsupported bulk action "${action}".`);
    const rows = await handler(client, ids);
    await activity.record({
      action: `template.bulk_${action}`,
      entity: "template",
      entityId: ids.join(","),
      metadata: { count: rows.length },
    });
    res.json({ ok: true, action, count: rows.length });
  }

  /** Single-template state transitions that share the same audit trail. */
  function templateAction(name) {
    return async (req, res) => {
      const client = supabase();
      const existing = await templates.findById(client, req.params.id);
      const row = TEMPLATE_ACTIONS[name]
        ? await TEMPLATE_ACTIONS[name](client, existing)
        : await runVerificationAction(name, req, existing);
      await activity.record({
        action: `template.${name}`,
        entity: "template",
        entityId: existing.id,
        metadata: { slug: existing.slug, status: row?.status, featured: row?.featured },
      });
      res.json(row);
    };
  }

  async function runVerificationAction(name, req, existing) {
    if (name === "verify") {
      const row = await verification.verify(existing.id, {
        actor: "admin",
        reason: req.body?.reason || "",
        score: typeof req.body?.score === "number" ? req.body.score : undefined,
      });
      return templates.requireRow(row, "Template not found.");
    }
    const row = await verification.revoke(existing.id, {
      actor: "admin",
      reason: req.body?.reason || "Removed by administrator.",
    });
    return templates.requireRow(row, "Template not found.");
  }

  // --------------------------------------------------------------------------
  // Categories, tags, publishers
  // --------------------------------------------------------------------------
  async function listCategories(req, res) {
    const client = supabase();
    const [rows, counts] = await Promise.all([
      taxonomy.listCategories(client),
      taxonomy.countsByCategory(client),
    ]);
    res.json(rows.map((row) => ({ ...row, templateCount: counts.get(row.id) || 0 })));
  }

  async function createCategory(req, res) {
    const payload = validateCategory(req.body || {});
    const client = supabase();
    await assertSlugAvailable(client, payload.slug, null, "categories");
    const data = await taxonomy.insertCategory(client, taxonomy.toCategoryRow(payload));
    await activity.record({
      action: "category.created", entity: "category", entityId: data.id, metadata: { slug: data.slug },
    });
    res.status(201).json(data);
  }

  async function updateCategory(req, res) {
    const client = supabase();
    const payload = validateCategory(req.body || {});
    await assertSlugAvailable(client, payload.slug, req.params.id, "categories");
    const data = templates.requireRow(
      await taxonomy.updateCategory(client, req.params.id, taxonomy.toCategoryRow(payload)),
      "Category not found.",
    );
    await activity.record({
      action: "category.updated", entity: "category", entityId: data.id, metadata: { slug: data.slug },
    });
    res.json(data);
  }

  async function deleteCategory(req, res) {
    const client = supabase();
    const data = templates.requireRow(
      await taxonomy.deleteCategory(client, req.params.id),
      "Category not found.",
    );
    await activity.record({
      action: "category.deleted", entity: "category", entityId: req.params.id, metadata: { slug: data.slug },
    });
    res.json({ ok: true });
  }

  async function listTags(req, res) {
    const client = supabase();
    const [rows, counts] = await Promise.all([
      taxonomy.listTags(client),
      taxonomy.tagLinkCounts(client),
    ]);
    res.json(rows.map((row) => ({ ...row, templateCount: counts.get(row.id) || 0 })));
  }

  async function createTag(req, res) {
    const payload = validateTag(req.body || {});
    const client = supabase();
    await assertSlugAvailable(client, payload.slug, null, "tags");
    const data = await taxonomy.insertTag(client, payload);
    await activity.record({ action: "tag.created", entity: "tag", entityId: data.id, metadata: { slug: data.slug } });
    res.status(201).json(data);
  }

  async function updateTag(req, res) {
    const client = supabase();
    const payload = validateTag(req.body || {});
    await assertSlugAvailable(client, payload.slug, req.params.id, "tags");
    const data = templates.requireRow(await taxonomy.updateTag(client, req.params.id, payload), "Tag not found.");
    await activity.record({ action: "tag.updated", entity: "tag", entityId: data.id, metadata: { slug: data.slug } });
    res.json(data);
  }

  async function deleteTag(req, res) {
    const client = supabase();
    const data = templates.requireRow(await taxonomy.deleteTag(client, req.params.id), "Tag not found.");
    await activity.record({
      action: "tag.deleted", entity: "tag", entityId: req.params.id, metadata: { slug: data.slug },
    });
    res.json({ ok: true });
  }

  async function listPublishers(req, res) {
    const client = supabase();
    const [rows, counts] = await Promise.all([
      taxonomy.listPublishers(client),
      taxonomy.countsByPublisher(client),
    ]);
    res.json(rows.map((row) => ({ ...row, templateCount: counts.get(row.id) || 0 })));
  }

  async function createPublisher(req, res) {
    const payload = validatePublisher(req.body || {});
    const client = supabase();
    await assertSlugAvailable(client, payload.slug, null, "publishers");
    const data = await taxonomy.insertPublisher(client, taxonomy.toPublisherRow(payload));
    await activity.record({
      action: "publisher.created", entity: "publisher", entityId: data.id, metadata: { slug: data.slug },
    });
    res.status(201).json(data);
  }

  async function updatePublisher(req, res) {
    const client = supabase();
    const payload = validatePublisher(req.body || {});
    await assertSlugAvailable(client, payload.slug, req.params.id, "publishers");
    const data = templates.requireRow(
      await taxonomy.updatePublisher(client, req.params.id, taxonomy.toPublisherRow(payload)),
      "Publisher not found.",
    );
    await activity.record({
      action: "publisher.updated", entity: "publisher", entityId: data.id, metadata: { slug: data.slug },
    });
    res.json(data);
  }

  async function deletePublisher(req, res) {
    const client = supabase();
    const owned = await taxonomy.publisherTemplateIds(client, req.params.id);
    if (owned.length) {
      throw conflict(`This publisher still owns ${owned.length} template(s). Reassign or delete them first.`, {
        templateCount: owned.length,
      });
    }
    const data = templates.requireRow(
      await taxonomy.deletePublisher(client, req.params.id),
      "Publisher not found.",
    );
    await activity.record({
      action: "publisher.deleted", entity: "publisher", entityId: req.params.id, metadata: { slug: data.slug },
    });
    res.json({ ok: true });
  }

  // --------------------------------------------------------------------------
  // Submissions
  // --------------------------------------------------------------------------
  async function listSubmissions(req, res) {
    const client = supabase();
    const page = intParam(req.query.page, 1, { min: 1, max: 10_000 });
    const perPage = intParam(req.query.perPage, 20, { min: 1, max: 100 });
    const status = String(req.query.status || "");
    if (status && !SUBMISSION_STATUSES.includes(status)) throw badRequest("Unknown submission status.");

    const { rows, total } = await submissions.list(client, { status, page, perPage });
    const [categories, publishers] = await Promise.all([
      taxonomy.categoryOptions(client),
      taxonomy.publisherOptions(client),
    ]);
    if (categories.error || publishers.error) throw upstream();
    const categoryById = new Map((categories.data || []).map((row) => [row.id, row]));
    const publisherById = new Map((publishers.data || []).map((row) => [row.id, row]));

    res.json(view.paged(
      rows.map((row) => view.submissionListItem(row, { categoryById, publisherById })),
      { total, page, perPage },
    ));
  }

  async function getSubmission(req, res) {
    const row = templates.requireRow(
      await submissions.findById(supabase(), req.params.id),
      "Submission not found.",
    );
    res.json(row);
  }

  async function approveSubmission(req, res) {
    const client = supabase();
    const submission = templates.requireRow(
      await submissions.findById(client, req.params.id),
      "Submission not found.",
    );
    if (submission.status === "approved") throw conflict("This submission is already approved.");

    const payload = validateTemplate({
      name: submission.name,
      description: submission.description,
      longDescription: submission.long_description,
      version: submission.version,
      license: submission.license,
      repositoryUrl: submission.repository_url,
      documentationUrl: submission.documentation_url,
      downloadUrl: submission.download_url,
      previewImage: submission.preview_image,
      previewImages: submission.preview_images,
      sampleFile: submission.sample_file,
      categoryId: submission.category_id,
      publisherId: submission.publisher_id || await resolvePublisher(client, submission),
      tags: submission.tags,
      status: req.body?.status === "draft" ? "draft" : "published",
      slug: req.body?.slug || slugify(submission.name),
    }, { requirePublishable: true });

    await assertSlugAvailable(client, payload.slug);
    const template = await templates.insert(client, payload);
    await templates.syncTags(client, template.id, payload.tags);
    const updated = await submissions.markApproved(client, submission.id, template.id);

    await activity.record({
      action: "submission.approved",
      entity: "submission",
      entityId: submission.id,
      metadata: { templateSlug: template.slug, templateStatus: template.status },
    });

    res.json({ submission: updated, template });
  }

  async function rejectSubmission(req, res) {
    const client = supabase();
    const submission = templates.requireRow(
      await submissions.findById(client, req.params.id),
      "Submission not found.",
    );
    if (submission.status === "rejected") throw conflict("This submission is already rejected.");

    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 1000) : "";
    const updated = await submissions.markRejected(client, submission.id, reason);

    await activity.record({
      action: "submission.rejected",
      entity: "submission",
      entityId: submission.id,
      metadata: { name: submission.name, reason: reason || null },
    });

    res.json(updated);
  }

  // --------------------------------------------------------------------------
  // Registry, analytics, settings, activity
  // --------------------------------------------------------------------------
  async function generateRegistryFile(req, res) {
    try {
      const registry = await generateRegistry(supabase(), { targetPath: config.registryPath });
      await activity.record({
        action: "registry.generated",
        entity: "registry",
        entityId: "site/registry.json",
        metadata: registry.counts,
      });
      res.json({ ok: true, path: "site/registry.json", counts: registry.counts, generatedAt: registry.generatedAt });
    } catch (error) {
      if (error.problems) throw badRequest("Registry generation failed validation.", { problems: error.problems });
      throw error;
    }
  }

  async function analytics(req, res) {
    const client = supabase();
    const days = intParam(req.query.days, 30, { min: 1, max: 365 });
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [events, rows, topViewed, topDownloaded] = await Promise.all([
      eventsSince(client, since.toISOString()),
      templates.statTotals(client),
      templates.topBy(client, "views", 10),
      templates.topBy(client, "downloads", 10),
    ]);
    if (topViewed.error || topDownloaded.error) throw upstream();

    const buckets = [];
    const index = new Map();
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      index.set(date, buckets.length);
      buckets.push({ date, views: 0, downloads: 0 });
    }
    for (const event of events) {
      const position = index.get(String(event.occurred_at).slice(0, 10));
      if (position === undefined) continue;
      if (event.event_type === "download") buckets[position].downloads += 1;
      else buckets[position].views += 1;
    }

    const totals = rows.reduce((accumulator, row) => ({
      views: accumulator.views + Number(row.views || 0),
      downloads: accumulator.downloads + Number(row.downloads || 0),
    }), { views: 0, downloads: 0 });

    res.json(view.analytics({
      days,
      since: since.toISOString(),
      totals,
      buckets,
      topViewed: topViewed.data || [],
      topDownloaded: topDownloaded.data || [],
      templates: {
        total: rows.length,
        published: rows.filter((row) => row.status === "published").length,
      },
      eventsRecorded: events.length,
    }));
  }

  async function getSettings(req, res) {
    res.json(await settings.all(supabase()));
  }

  async function putSettings(req, res) {
    const entries = Object.entries(req.body || {})
      .filter(([key]) => /^[a-z0-9_.:-]{1,64}$/i.test(key));
    if (!entries.length) throw badRequest("No valid settings supplied.");
    const keys = await settings.upsertMany(supabase(), entries);
    await activity.record({ action: "settings.updated", entity: "settings", metadata: { keys } });
    res.json({ ok: true, keys });
  }

  async function listActivity(req, res) {
    const page = intParam(req.query.page, 1, { min: 1, max: 10_000 });
    const perPage = intParam(req.query.perPage, 50, { min: 1, max: 200 });
    const entity = String(req.query.entity || "");
    const { items, total } = await activity.list({ page, perPage, entity });
    res.json(view.paged(items, { total, page, perPage }));
  }

  // --------------------------------------------------------------------------
  // Admin User Management
  // --------------------------------------------------------------------------
  async function listAdminUsers(req, res) {
    const client = supabase();
    const users = await adminUsers.listAdminUsers(client);
    res.json(users);
  }

  async function createAdminUser(req, res) {
    const client = supabase();
    const { username, password, role } = req.body || {};
    const user = await adminUsers.createAdminUser(client, { username, password, role });
    await activity.record({
      action: "admin_user.created",
      entity: "admin_user",
      entityId: user.id,
      actor: req.adminUsername || "admin",
      metadata: { username: user.username, role: user.role },
    });
    res.status(201).json(user);
  }

  async function deleteAdminUser(req, res) {
    const client = supabase();
    const result = await adminUsers.deleteAdminUser(
      client,
      req.params.id,
      req.adminUsername,
      config.adminUsername,
    );
    await activity.record({
      action: "admin_user.deleted",
      entity: "admin_user",
      entityId: result.id,
      actor: req.adminUsername || "admin",
      metadata: { username: result.username },
    });
    res.json({ ok: true, id: result.id });
  }

  return {
    analytics,
    approveSubmission,
    bulkTemplates,
    createAdminUser,
    createCategory,
    createPublisher,
    createTag,
    createTemplate,
    dashboard,
    deleteAdminUser,
    deleteCategory,
    deletePublisher,
    deleteTag,
    deleteTemplate,
    generateRegistryFile,
    getSettings,
    getSubmission,
    getTemplate: getOneTemplate,
    listActivity,
    listAdminUsers,
    listCategories,
    listPublishers,
    listSubmissions,
    listTags,
    listTemplates,
    login,
    logout,
    putSettings,
    rejectSubmission,
    session,
    templateAction,
    updateCategory,
    updatePublisher,
    updateTag,
    updateTemplate,
  };
}

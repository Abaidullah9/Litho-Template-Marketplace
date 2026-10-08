import { badRequest, notFound, upstream } from "../errors.js";
import { clientKey, createRateLimiter } from "../rate-limit.js";
import { uploadedPath } from "../uploads.js";
import { validateSubmission } from "../validation.js";
import { fetchTaxonomy, hydrateTemplates, readRegistry } from "../services/registry.js";
import { intParam, safeIdentifier } from "../utils/query.js";
import * as templates from "../models/templates.js";
import * as submissions from "../models/submissions.js";
import * as taxonomy from "../models/taxonomy.js";
import * as view from "../views/public-view.js";

/**
 * Public marketplace controller.
 *
 * Handlers own request parsing, taxonomy resolution and status codes; data
 * access lives in `models/` and response shapes in `views/`.
 */
export function createPublicController({ config, supabase }) {
  const viewLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
  const submissionLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

  /**
   * Public clients send taxonomy references as slugs (what GET /api/categories
   * and /api/publishers expose). Resolve them to the foreign keys the tables need.
   */
  async function resolveReference(client, table, value, field) {
    if (!value) return null;
    const id = await taxonomy.resolveId(client, table, value);
    if (!id) {
      const label = field === "categoryId" ? "category" : "publisher";
      throw badRequest("Please fix the highlighted fields.", {
        [field]: `Unknown ${label}. Pick one from the list or leave it blank.`,
      });
    }
    return id;
  }

  async function rateLimited(req, res, limiter, scope) {
    const limit = limiter.check(`${clientKey(req)}:${scope}`);
    if (limit.allowed) return false;
    res.status(429).json({ error: { code: "rate_limited", message: "Too many events. Try again shortly." } });
    return true;
  }

  function health(req, res) {
    res.json(view.health(config));
  }

  /** GET /api/templates — search, filter, sort and paginate published templates. */
  async function listTemplates(req, res) {
    const {
      q = "", category = "", tag = "", publisher = "",
      featured = "", verified = "", sort = "newest",
    } = req.query;
    const page = intParam(req.query.page, 1, { min: 1, max: 10_000 });
    const perPage = intParam(req.query.perPage ?? req.query.limit, 24, { min: 1, max: 100 });
    const client = supabase();
    const fetched = await fetchTaxonomy(client);

    let categoryId = null;
    if (category) {
      const match = fetched.categories.find((item) => item.slug === category);
      if (!match) return res.json(view.emptyPage(page, perPage));
      categoryId = match.id;
    }

    let publisherId = null;
    if (publisher) {
      const match = fetched.publishers.find((item) => item.slug === publisher);
      if (!match) return res.json(view.emptyPage(page, perPage));
      publisherId = match.id;
    }

    let templateIds = null;
    if (tag) {
      const match = fetched.tags.find((item) => item.slug === tag);
      if (!match) return res.json(view.emptyPage(page, perPage));
      const links = await client.from("template_tags").select("template_id").eq("tag_id", match.id);
      if (links.error) throw upstream();
      templateIds = (links.data || []).map((row) => row.template_id);
      if (!templateIds.length) return res.json(view.emptyPage(page, perPage));
    }

    const { rows, total } = await templates.listPublished(client, {
      q, categoryId, publisherId, templateIds, featured, verified, sort, page, perPage,
    });

    res.json(view.paged(hydrateTemplates(rows, fetched), { total, page, perPage }));
  }

  /** GET /api/templates/:slug */
  async function showTemplate(req, res) {
    const client = supabase();
    const identifier = safeIdentifier(req.params.slug);
    const row = await templates.findPublished(client, identifier);
    if (!row) throw notFound("Template not found.");
    const fetched = await fetchTaxonomy(client);
    const [entry] = hydrateTemplates([row], fetched);
    res.json(entry);
  }

  async function recordEvent(identifierValue, type, res) {
    const client = supabase();
    const identifier = safeIdentifier(identifierValue);
    const template = await templates.findIdentity(client, identifier);
    if (!template || template.status !== "published") throw notFound("Template not found.");
    await templates.recordStatEvent(client, { templateId: template.id, type });
    res.status(202).json(view.eventAccepted(type, template.slug));
  }

  /** POST /api/templates/:identifier/view — anonymous marketplace analytics. */
  async function recordView(req, res) {
    if (await rateLimited(req, res, viewLimiter, req.params.identifier)) return;
    await recordEvent(req.params.identifier, "view", res);
  }

  /** POST /api/templates/:identifier/download */
  async function recordDownload(req, res) {
    if (await rateLimited(req, res, viewLimiter, req.params.identifier)) return;
    await recordEvent(req.params.identifier, "download", res);
  }

  /** GET /api/categories */
  async function listCategories(req, res) {
    const client = supabase();
    const [categories, counts] = await Promise.all([
      taxonomy.listEnabledCategories(client),
      taxonomy.countsByCategory(client, { publishedOnly: true }),
    ]);
    res.json(categories.map((category) => view.categorySummary(category, counts.get(category.id) || 0)));
  }

  /** GET /api/categories/:slug */
  async function showCategory(req, res) {
    const client = supabase();
    const category = await taxonomy.findCategoryBySlug(client, req.params.slug);
    if (!category || category.enabled === false) throw notFound("Category not found.");
    const { rows, total } = await taxonomy.publishedInCategory(client, category.id);
    const fetched = await fetchTaxonomy(client);
    res.json(view.categoryDetail(category, { templates: hydrateTemplates(rows, fetched), total }));
  }

  /** GET /api/tags — tags that actually label a published template. */
  async function listTags(req, res) {
    const client = supabase();
    const [tags, links, published] = await Promise.all([
      taxonomy.listTags(client),
      taxonomy.allTagLinks(client),
      taxonomy.publishedTemplateIds(client),
    ]);
    const counts = new Map();
    for (const link of links) {
      if (!published.has(link.template_id)) continue;
      counts.set(link.tag_id, (counts.get(link.tag_id) || 0) + 1);
    }
    res.json(tags
      .map((tag) => view.tagSummary(tag, counts.get(tag.id) || 0))
      .filter((tag) => tag.templateCount > 0));
  }

  /** GET /api/publishers */
  async function listPublishers(req, res) {
    const client = supabase();
    const [publishers, counts] = await Promise.all([
      taxonomy.listEnabledPublishers(client),
      taxonomy.countsByPublisher(client, { publishedOnly: true }),
    ]);
    res.json(publishers.map((publisher) => view.publisherSummary(publisher, counts.get(publisher.id) || 0)));
  }

  /** POST /api/submissions — public, account-free template submission. */
  async function createSubmission(req, res) {
    if (!submissionLimiter.check(clientKey(req)).allowed) {
      throw badRequest("Too many submissions from this address. Please wait a minute and try again.");
    }

    const client = supabase();
    const payload = validateSubmission(req.body || {});
    payload.categoryId = await resolveReference(client, "categories", payload.categoryId, "categoryId");
    payload.publisherId = await resolveReference(client, "publishers", payload.publisherId, "publisherId");

    const files = req.files || {};
    payload.previewImage = uploadedPath(files.previewImage?.[0]) || payload.previewImage;
    payload.sampleFile = uploadedPath(files.sampleFile?.[0]) || payload.sampleFile;

    const row = {
      name: payload.name,
      description: payload.description,
      long_description: payload.longDescription,
      category_id: payload.categoryId,
      publisher_id: payload.publisherId,
      publisher_name: payload.publisherName,
      submitter_name: payload.submitterName,
      submitter_email: payload.submitterEmail,
      version: payload.version,
      license: payload.license,
      repository_url: payload.repositoryUrl || null,
      documentation_url: payload.documentationUrl || null,
      download_url: payload.downloadUrl || null,
      preview_image: payload.previewImage || null,
      preview_images: payload.previewImages,
      sample_file: payload.sampleFile || null,
      tags: payload.tags,
      status: "pending",
    };

    const created = await submissions.insert(client, row);
    res.status(201).json(view.submissionReceipt(created));
  }

  /** GET /api/registry — the generated public catalog snapshot. */
  async function getRegistry(req, res) {
    const registry = await readRegistry(config.registryPath);
    if (!registry) {
      throw notFound("No registry generated yet. Run `npm run registry:generate` or use the admin Registry page.");
    }
    res.json(registry);
  }

  return {
    createSubmission,
    getRegistry,
    health,
    listCategories,
    listPublishers,
    listTags,
    listTemplates,
    recordDownload,
    recordView,
    showCategory,
    showTemplate,
  };
}

/**
 * Verification is a separate, pluggable service — not template CRUD.
 *
 *   VerificationService ──▶ VerificationProvider
 *                            ├── ManualVerificationProvider   (current)
 *                            └── AIVerificationProvider       (future)
 *
 * The service owns persistence and the activity log. A provider only has to
 * return the result shape below, so an AI provider can be dropped in later
 * without touching the database, admin dashboard, submissions, marketplace UI,
 * registry or public API.
 *
 * Verification result shape (all fields optional except status):
 *   {
 *     verification_status: "verified" | "rejected" | "pending" | "unverified",
 *     verification_method: "manual" | "ai" | ...,
 *     verification_score?: 0..1,
 *     verification_reason?: string,
 *     verified_at?: ISO timestamp | null,
 *     verification_metadata?: object
 *   }
 */

export const VERIFICATION_RESULT_FIELDS = Object.freeze([
  "verification_status",
  "verification_method",
  "verification_score",
  "verification_reason",
  "verified_at",
  "verification_metadata",
]);

/** Contract every verification provider must satisfy. */
export class VerificationProvider {
  /** Stable identifier stored in templates.verification_method. */
  get method() {
    throw new Error("VerificationProvider.method must be implemented");
  }

  /**
   * @param {{ template: object, context: object }} input
   * @returns {Promise<object>} verification result (see shape above)
   */
  async verify() {
    throw new Error("VerificationProvider.verify must be implemented");
  }

  /** Revoke an existing verification. Default: mark unverified. */
  async revoke({ context = {} } = {}) {
    return {
      verification_status: "unverified",
      verification_method: this.method,
      verification_score: null,
      verification_reason: context.reason || "Verification removed by an administrator.",
      verified_at: null,
      verification_metadata: { actor: context.actor || "admin" },
    };
  }
}

/**
 * Current provider: an administrator decides, with an optional reason.
 * AI verification later implements the same interface (and can return
 * `verification_status: "pending"` when a human must confirm the result).
 */
export class ManualVerificationProvider extends VerificationProvider {
  get method() {
    return "manual";
  }

  async verify({ template = {}, context = {} } = {}) {
    const decision = context.decision === "rejected" ? "rejected" : "verified";
    const now = new Date().toISOString();
    return {
      verification_status: decision,
      verification_method: this.method,
      verification_score: typeof context.score === "number" ? context.score : null,
      verification_reason: context.reason
        || (decision === "verified"
          ? `Reviewed manually by ${context.actor || "admin"}.`
          : `Rejected by ${context.actor || "admin"}.`),
      verified_at: decision === "verified" ? now : null,
      verification_metadata: {
        actor: context.actor || "admin",
        template: template.slug || template.id || null,
        decidedAt: now,
      },
    };
  }
}

function pickResult(result) {
  const clean = {};
  for (const field of VERIFICATION_RESULT_FIELDS) {
    if (result && result[field] !== undefined) clean[field] = result[field];
  }
  clean.verification_method = clean.verification_method || "manual";
  clean.verification_status = clean.verification_status || "unverified";
  return clean;
}

export class VerificationService {
  constructor({ supabase, provider = new ManualVerificationProvider(), activity = null }) {
    this.supabase = supabase;
    this.provider = provider;
    this.activity = activity;
  }

  get method() {
    return this.provider.method;
  }

  async #load(templateId) {
    const { data, error } = await this.supabase
      .from("templates")
      .select("id, slug, name, status, verified, verification_status")
      .eq("id", templateId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async #persist(templateId, result, actor) {
    const row = {
      verified: result.verification_status === "verified",
      verification_status: result.verification_status,
      verification_method: result.verification_method,
      verification_score: result.verification_score ?? null,
      verification_reason: result.verification_reason ?? null,
      verified_at: result.verified_at ?? null,
      verification_metadata: result.verification_metadata || {},
    };
    const { data, error } = await this.supabase
      .from("templates")
      .update(row)
      .eq("id", templateId)
      .select("id, slug, name, verified, verification_status, verification_method, verification_score, verification_reason, verified_at")
      .maybeSingle();
    if (error) throw error;

    await this.activity?.record({
      action: row.verified ? "template.verified" : "template.unverified",
      entity: "template",
      entityId: templateId,
      actor,
      metadata: {
        slug: data?.slug,
        method: row.verification_method,
        status: row.verification_status,
        reason: row.verification_reason,
      },
    });

    return data;
  }

  async verify(templateId, context = {}) {
    const template = await this.#load(templateId);
    if (!template) return null;
    const result = pickResult(await this.provider.verify({ template, context }));
    return this.#persist(templateId, result, context.actor);
  }

  async revoke(templateId, context = {}) {
    const template = await this.#load(templateId);
    if (!template) return null;
    const result = pickResult(await this.provider.revoke({ template, context }));
    return this.#persist(templateId, result, context.actor);
  }
}

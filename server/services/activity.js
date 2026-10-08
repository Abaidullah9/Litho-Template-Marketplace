/**
 * Admin activity log.
 *
 * Records `action`, `entity`, `entity_id`, `timestamp` (from Postgres) and
 * `metadata`. A log failure never breaks the operation it describes.
 */
export function createActivityLog(supabase, { onError = console.error } = {}) {
  async function record({ action, entity, entityId, metadata = {}, actor = "admin" }) {
    if (!supabase) {
      onError("activity log write skipped: Supabase client unavailable");
      return false;
    }
    try {
      const { error } = await supabase.from("admin_activity_logs").insert({
        action,
        entity,
        entity_id: entityId == null ? null : String(entityId),
        actor,
        metadata,
      });
      if (error) {
        onError("activity log write failed", error);
        return false;
      }
      return true;
    } catch (error) {
      onError("activity log write failed", error);
      return false;
    }
  }

  async function list({ page = 1, perPage = 50, entity = "" } = {}) {
    const from = (page - 1) * perPage;
    let query = supabase
      .from("admin_activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1);
    if (entity) query = query.eq("entity", entity);
    const { data, error, count } = await query;
    if (error) throw error;
    return { items: data || [], total: count || 0 };
  }

  return { record, list };
}

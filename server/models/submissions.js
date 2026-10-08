import { badRequest, upstream } from "../errors.js";

/** Insert a public submission; the unique index guards duplicate names. */
async function insert(client, row) {
  const { data, error } = await client
    .from("submissions").insert(row).select("id, name, status, created_at").single();
  if (error) {
    if (error.code === "23505") throw badRequest("A submission with this name already exists.");
    throw upstream();
  }
  return data;
}

async function findById(client, id) {
  const { data, error } = await client.from("submissions").select("*").eq("id", id).maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function list(client, { status = "", page = 1, perPage = 20 } = {}) {
  let query = client.from("submissions").select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  if (status) query = query.eq("status", status);
  const { data, error, count } = await query;
  if (error) throw upstream();
  return { rows: data || [], total: count || 0 };
}

async function markApproved(client, id, templateId) {
  const { data, error } = await client
    .from("submissions")
    .update({
      status: "approved",
      template_id: templateId,
      reviewed_at: new Date().toISOString(),
      reviewed_by: "admin",
      reject_reason: null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function markRejected(client, id, reason) {
  const { data, error } = await client
    .from("submissions")
    .update({
      status: "rejected",
      reject_reason: reason || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: "admin",
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw upstream();
  return data || null;
}

async function countByStatus(client, status) {
  const { count, error } = await client
    .from("submissions").select("id", { count: "exact", head: true }).eq("status", status);
  if (error) throw upstream();
  return count || 0;
}

function recentPending(client, limit) {
  return client
    .from("submissions")
    .select("id, name, status, created_at, submitter_name")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);
}

export { countByStatus, findById, insert, list, markApproved, markRejected, recentPending };

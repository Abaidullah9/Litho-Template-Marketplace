import { upstream } from "../errors.js";

/** Settings are stored as rows and exposed as a flat key/value object. */
async function all(client) {
  const { data, error } = await client.from("settings").select("*").order("key");
  if (error) throw upstream();
  return Object.fromEntries((data || []).map((row) => [row.key, row.value]));
}

async function upsertMany(client, entries) {
  const { error } = await client
    .from("settings")
    .upsert(entries.map(([key, value]) => ({ key, value })), { onConflict: "key" });
  if (error) throw upstream();
  return entries.map(([key]) => key);
}

export { all, upsertMany };

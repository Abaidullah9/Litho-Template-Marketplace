import { upstream } from "../errors.js";

/**
 * Raw events inside a reporting window, oldest first.
 *
 * The cap keeps a runaway period from streaming an unbounded result set; the
 * analytics view reports how many events were actually read.
 */
const EVENT_READ_CAP = 50_000;

async function eventsSince(client, sinceIso) {
  const { data, error } = await client
    .from("analytics_events")
    .select("event_type, occurred_at")
    .gte("occurred_at", sinceIso)
    .order("occurred_at", { ascending: true })
    .limit(EVENT_READ_CAP);
  if (error) throw upstream();
  return data || [];
}

export { EVENT_READ_CAP, eventsSince };

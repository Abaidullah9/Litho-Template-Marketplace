import { conflict, upstream } from "../errors.js";

/**
 * Reject a slug that another row already owns.
 *
 * `currentId` allows a row to keep its own slug during an update; `table`
 * keeps the guard reusable across the taxonomy tables.
 */
async function assertSlugAvailable(client, slug, currentId = null, table = "templates") {
  const { data, error } = await client.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw upstream();
  if (data && data.id !== currentId) {
    throw conflict(`The slug "${slug}" is already taken.`, { slug: "Choose a different slug." });
  }
}

export { assertSlugAvailable };

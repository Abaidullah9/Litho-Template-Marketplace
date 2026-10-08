/**
 * Admin API serialization.
 *
 * Joins (category/publisher names, tag names) are applied here so the
 * controller only orchestrates fetches and the models only read rows.
 */

function paged(items, { total, page, perPage }) {
  return {
    items,
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

function templateListItem(row, { categoryById, publisherById, tagsByTemplate }) {
  return {
    ...row,
    categoryName: row.category_id ? categoryById.get(row.category_id)?.name || "" : "",
    publisherName: row.publisher_id ? publisherById.get(row.publisher_id)?.name || "" : "",
    tagNames: tagsByTemplate.get(row.id) || [],
  };
}

function submissionListItem(row, { categoryById, publisherById }) {
  return {
    ...row,
    categoryName: row.category_id ? categoryById.get(row.category_id)?.name || "" : "",
    publisherName: row.publisher_id
      ? publisherById.get(row.publisher_id)?.name || ""
      : row.publisher_name || "",
  };
}

/** Dashboard tiles plus the recent-activity panels below them. */
function dashboard({
  counts,
  recentTemplates = [],
  recentSubmissions = [],
  topViewed = [],
  topDownloaded = [],
}) {
  return { counts, recentTemplates, recentSubmissions, topViewed, topDownloaded };
}

function analytics({
  days,
  since,
  totals,
  buckets = [],
  topViewed = [],
  topDownloaded = [],
  templates,
  eventsRecorded = 0,
}) {
  return {
    range: { days, since },
    totals,
    daily: buckets,
    topViewed,
    topDownloaded,
    templates,
    eventsRecorded,
  };
}

export { analytics, dashboard, paged, submissionListItem, templateListItem };

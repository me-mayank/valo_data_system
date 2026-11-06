/**
 * Normalizes query pagination parameters with safe defaults and caps.
 * @param {Record<string, unknown>} query
 * @param {number} [defaultPageSize=25]
 * @param {number} [maxPageSize=100]
 * @returns {{ page: number, pageSize: number, skip: number, limit: number }}
 */
export function getPaginationParams(query = {}, defaultPageSize = 25, maxPageSize = 100) {
  const pageRaw = parseInt(String(query.page), 10);
  const pageSizeRaw = parseInt(String(query.pageSize), 10);

  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  let pageSize = Number.isInteger(pageSizeRaw) && pageSizeRaw > 0 ? pageSizeRaw : defaultPageSize;

  if (pageSize > maxPageSize) {
    pageSize = maxPageSize;
  }

  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    limit: pageSize,
  };
}


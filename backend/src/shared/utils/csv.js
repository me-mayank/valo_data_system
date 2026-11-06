/**
 * Escapes a cell value and neutralizes formula injection triggers for spreadsheet applications.
 * @param {unknown} val
 * @returns {string}
 */
export function sanitizeCsvCell(val) {
  if (val === null || val === undefined) {
    return '""';
  }

  let str = String(val);

  // Formula injection defense: prefix dangerous leading characters with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

/**
 * Converts headers and rows array to a sanitized CSV string prefixed with UTF-8 BOM.
 * @param {Array<{ key: string, label: string }>} columns
 * @param {Array<Record<string, unknown>>} rows
 * @returns {string}
 */
export function generateCsv(columns, rows) {
  // UTF-8 BOM (\uFEFF) ensures Excel opens multilingual and special characters properly
  const bom = '\uFEFF';

  const headerLine = columns.map((col) => sanitizeCsvCell(col.label)).join(',');

  const dataLines = rows.map((row) =>
    columns.map((col) => sanitizeCsvCell(row[col.key])).join(',')
  );

  return `${bom}${headerLine}\r\n${dataLines.join('\r\n')}\r\n`;
}


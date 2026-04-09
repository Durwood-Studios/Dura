/**
 * Minimal CSV serializer. Quotes fields containing comma / quote / newline
 * per RFC 4180. No external dependency.
 */

export function toCSV<T extends Record<string, unknown>>(rows: T[], columns: (keyof T)[]): string {
  if (rows.length === 0) return columns.join(",") + "\n";
  const header = columns.map((c) => escape(String(c))).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(formatCell(row[c]))).join(","))
    .join("\n");
  return header + "\n" + body + "\n";
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function escape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

import type { JobApplication, ParsedRow } from "./types";

export const formatDate = (value: string) =>
  value
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(`${value}T12:00:00`),
      )
    : "No date";

export const today = () => new Date().toISOString().slice(0, 10);

export const daysUntil = (value: string) =>
  Math.ceil((new Date(`${value}T23:59:59`).getTime() - new Date().getTime()) / 86_400_000);

export const daysSince = (value: string) =>
  Math.floor((new Date().getTime() - new Date(`${value}T00:00:00`).getTime()) / 86_400_000);

export const csvEscape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function applicationsToCsv(applications: JobApplication[]) {
  const keys: (keyof JobApplication)[] = [
    "company",
    "role",
    "dateApplied",
    "status",
    "resume",
    "recruiter",
    "recruiterEmail",
    "jobUrl",
    "nextAction",
    "deadline",
    "notes",
    "lastActionDate",
  ];
  return [keys.join(","), ...applications.map((app) => keys.map((key) => csvEscape(app[key])).join(","))].join("\n");
}

export function downloadText(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([content], { type }));
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export function parseCsv(text: string): ParsedRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += char;
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift() ?? [];
  return rows.map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header || `Column ${index + 1}`, cells[index] ?? ""])),
  );
}

export function googleExportUrl(value: string) {
  const sheets = value.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
  if (sheets) return `https://docs.google.com/spreadsheets/d/${sheets[1]}/export?format=csv`;
  const docs = value.match(/docs\.google\.com\/document\/d\/([^/]+)/);
  if (docs) return `https://docs.google.com/document/d/${docs[1]}/export?format=txt`;
  return value;
}

export const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

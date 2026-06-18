import { readFileSync } from "fs";
import { join } from "path";

/**
 * Read admin emails from the gitignored .admin file in the project root.
 * File format: lines starting with ADMIN_EMAILS= set the allowed email(s).
 * Multiple lines are additive. Blank lines and comments (#) are ignored.
 *
 * Returns an empty array if the file doesn't exist — in that case the admin
 * page falls back to "any authenticated user" (rely on NEXT_PUBLIC_ADMIN_ENABLED
 * being the gate). If the file exists, only listed emails are granted access.
 */
export function readAdminEmails(): string[] {
  const filePath = join(process.cwd(), ".admin");

  let contents: string;
  try {
    contents = readFileSync(filePath, "utf-8");
  } catch {
    // .admin not present — no email restriction
    return [];
  }

  const emails: string[] = [];
  for (const raw of contents.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.startsWith("ADMIN_EMAILS=")) {
      const value = line.slice("ADMIN_EMAILS=".length).trim().toLowerCase();
      if (value) emails.push(value);
    }
  }

  return emails;
}

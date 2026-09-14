import { getDatabase } from "@netlify/database";

/** Server-only Netlify Database client. Never import this from browser code. */
export function db() {
  return getDatabase();
}

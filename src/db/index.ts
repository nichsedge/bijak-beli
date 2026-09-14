import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

import path from "path";
import fs from "fs";

function getDatabaseUrl() {
  if (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL!;
  }

  const sourceDb = path.join(process.cwd(), "drizzle.db");

  // On Vercel / serverless runtime, /var/task is read-only, but /tmp is writable
  if (process.env.VERCEL && fs.existsSync(sourceDb)) {
    const tmpDb = path.join("/tmp", "drizzle.db");
    try {
      if (!fs.existsSync(tmpDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      }
      return `file:${tmpDb}`;
    } catch (e) {
      console.warn("Failed to copy db to /tmp, falling back to source path", e);
    }
  }

  return `file:${sourceDb}`;
}

const client = createClient({
  url: getDatabaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

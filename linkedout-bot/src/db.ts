import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDB(databaseUrl: string) {
  if (!_db) {
    const sql = neon(databaseUrl);
    _db = drizzle({ client: sql });
  }
  return _db;
}

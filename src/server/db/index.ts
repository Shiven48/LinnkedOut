import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { config } from "dotenv";

import * as schema from './schema';
import postgres from 'postgres';
config({ path: ".env" });

// Lazy initialization to avoid build-time errors
let _db: ReturnType<typeof drizzlePostgres> | null = null;

function getDb() {
  if (_db) return _db;

  if (!process.env.REMOTE_DATABASE_URL) {
    throw new Error("REMOTE_DATABASE_URL is missing");
  }

  const remoteClient = postgres(process.env.REMOTE_DATABASE_URL);
  _db = drizzlePostgres(remoteClient as any, { schema });
  return _db;
}

// Proxy that lazily initializes the database connection
const db = new Proxy({} as ReturnType<typeof drizzlePostgres>, {
  get(_target, prop) {
    const realDb = getDb();
    const value = (realDb as any)[prop];
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

export * from './schema'
export { db }

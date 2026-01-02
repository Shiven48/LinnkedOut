// Force IPv4 resolution BEFORE any imports that might use network
import dns from 'node:dns';
dns.setDefaultResultOrder?.('ipv4first');

// Also set via environment for extra safety
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --dns-result-order=ipv4first';

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

  // Ensure the connection URL has proper SSL mode
  let dbUrl = process.env.REMOTE_DATABASE_URL;
  if (!dbUrl.includes('sslmode=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }

  // Configure postgres client with options to prefer IPv4
  const remoteClient = postgres(dbUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connection: {
      application_name: 'linnkedout',
    },
    // Disable prepared statements which can cause issues
    prepare: false,
  });
  
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

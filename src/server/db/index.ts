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

// Singleton pattern for Next.js development
const globalForDb = global as unknown as {
  db: ReturnType<typeof drizzlePostgres> | undefined;
  client: ReturnType<typeof postgres> | undefined;
};

function getDb() {
  if (globalForDb.db) return globalForDb.db;

  if (!process.env.REMOTE_DATABASE_URL) {
    throw new Error("REMOTE_DATABASE_URL is missing");
  }

  // Ensure the connection URL has proper SSL mode
  let dbUrl = process.env.REMOTE_DATABASE_URL;
  if (!dbUrl.includes('sslmode=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }

  // Configure postgres client with options optimized for serverless
  const remoteClient = postgres(dbUrl, {
    connect_timeout: 10000, // 10 seconds
    idle_timeout: 1,        // Close idle connections almost immediately
    max_lifetime: 60 * 5,   // 5 minutes max for a connection
    max: 1,                 // CRITICAL: Set to 1 for serverless/pooling stability
    connection: {
      application_name: 'linnkedout',
    },
    // Disable prepared statements - required for many pooling solutions (like PgBouncer/Neon)
    prepare: false,
  });
  
  const dbInstance = drizzlePostgres(remoteClient as any, { schema });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.db = dbInstance;
    globalForDb.client = remoteClient;
  }
  
  return dbInstance;
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

import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import { config } from "dotenv";
import * as schema from './schema';
import postgres from 'postgres';
config({ path: ".env.local" });

if (!process.env.REMOTE_DATABASE_URL) {
    throw new Error('REMOTE_DATABASE_URL is missing');
}

const remoteClient = postgres(process.env.REMOTE_DATABASE_URL!);

const db = drizzlePostgres(remoteClient as any, { schema })

export * from './schema'
export { db }
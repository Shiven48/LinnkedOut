import { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env" });

const requiredEnvVars = ["REMOTE_DATABASE_URL"] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is missing from .env`);
  }
}

const remoteDbUrl = process.env.REMOTE_DATABASE_URL!;
const databaseUrl: string = remoteDbUrl;

// Connection pool for runtime
export const db = new Pool({
  connectionString: databaseUrl,
});

export default {
  schema: ["./src/server/db/schema.ts"],
  out: "./supabase/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  breakpoints: false,
  strict: true,
  // Ensure Drizzle doesn't try to manage Supabase internal schemas
  schemaFilter: ["public"],
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;

import { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

const requiredEnvVars = ['LOCAL_PG_DATABASE', 'REMOTE_DATABASE_URL'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is missing from .env.local`);
  }
}

const localDbUrl = process.env.LOCAL_PG_DATABASE!;
const remoteDbUrl = process.env.REMOTE_DATABASE_URL!;
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl:string = isProduction ? remoteDbUrl : localDbUrl;

// Connection pool for runtime
export const db = new Pool({
  connectionString: databaseUrl,
});

export default {
  schema: ['./src/server/db/schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  breakpoints: false,
  strict:true,
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
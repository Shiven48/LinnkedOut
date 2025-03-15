import { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
}
if (!process.env.REMOTE_DATABASE_URL) {
    throw new Error('REMOTE_DATABASE_URL is missing');
}

const localDbUrl: string = process.env.DATABASE_URL;
const remoteDbUrl: string = process.env.REMOTE_DATABASE_URL;

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = isProduction ? remoteDbUrl : localDbUrl;

export default {
    schema: './src/server/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: databaseUrl,
    },
} satisfies Config;
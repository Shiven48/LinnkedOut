import { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local'})

if(!process.env.DATABASE_URL) {
    throw new Error('Database URL is missing')
}

export default {
    schema: './src/server/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
} satisfies Config;
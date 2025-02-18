import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
}

const connectionString:string = process.env.DATABASE_URL;

const client = postgres(connectionString, { max:1 })
export const db = drizzle(client)

const queryClient = postgres(connectionString, {
    max: 10,
    prepare: false,
});
export const queryDb = drizzle(queryClient)

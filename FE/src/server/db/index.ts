import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from 'postgres'
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from './schema';

config({ path: ".env.local" });

if (!process.env.REMOTE_DATABASE_URL) {
    throw new Error('REMOTE_DATABASE_URL is missing');
}

if(!process.env.LOCAL_PG_DATABASE){
    throw new Error('DATABASE_URL is missing');
}

const LocalDb:string = process.env.LOCAL_PG_DATABASE!
const RemoteDb:string = process.env.REMOTE_DATABASE_URL!

const localClient = postgres(LocalDb);
const remoteClient = neon(RemoteDb);

const isProduction = process.env.NODE_ENV === "production";
let db: any;

if(isProduction){
    db = drizzleNeon(remoteClient, { schema }) 
} else{
    db = drizzlePostgres(localClient, { schema })
}
export * from './schema'
export { db }
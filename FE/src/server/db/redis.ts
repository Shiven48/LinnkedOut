import Redis from "ioredis"
import { config } from "dotenv"

config({ path: ".env.local" });

if(!process.env.LOCAL_REDIS_URL) {
    throw new Error("LOCAL_REDIS_URL is missing");
}


export const redis = new Redis(
    process.env.LOCAL_REDIS_URL
);
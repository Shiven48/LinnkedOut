import Redis from "ioredis"
import { config } from "dotenv"

config({ path: ".env.local" });

const isProduction = process.env.NODE_ENV === 'production'

if(isProduction){
    if(!process.env.REMOTE_REDIS_URL) {
        throw new Error("REMOTE_REDIS_URL is missing");
    }
} else {
    if(!process.env.LOCAL_REDIS_URL) {
        throw new Error("LOCAL_REDIS_URL is missing");
    }
}


export const redis = new Redis(
    isProduction ? process.env.REMOTE_REDIS_URL! : process.env.LOCAL_REDIS_URL!
);
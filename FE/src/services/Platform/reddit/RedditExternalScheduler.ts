import { REDDIT_BEARER_TOKEN_ENDPOINT } from '@/services/common/constants';
import { RedditBearerApiEndpointResponse } from '@/services/common/types';
import { utility } from '@/services/common/utils';
import Redis from 'ioredis'

export class RedditExternalSchedular {
    private redis: Redis;
    private tokenKey = 'reddit:bearer_token';

    constructor(redisInstance: Redis) {
        this.redis = redisInstance
    }

    // This method would be called by external scheduler (cron, AWS EventBridge, etc.)
    async refreshToken(): Promise<void> {
        try{
            console.log('Scheduler started refreshing token ...');
            const token:RedditBearerApiEndpointResponse = await this.performTokenRefresh();
            await this.storeToken(token);
            console.log('Finished Scheduling refresh token')
        } catch(error) {
            console.error('Failed to refresh the bearer token',error);
            throw error;            
        }
    }

    async getValidToken(): Promise<string> {
        const tokenData = await this.getStoredToken();
        
        if (!tokenData || Date.now() >= tokenData.expires_in) {
            throw new Error('Token expired - external scheduler should have refreshed it');
        }
        
        return tokenData.access_token;
    }

    private async performTokenRefresh(): Promise<RedditBearerApiEndpointResponse> {
        try{
            this.validateCredentials();
            const bodyData = new URLSearchParams({
                'grant_type': 'password',
                'username': process.env.REDDIT_USERNAME!,
                'password': process.env.REDDIT_PASSWORD!
            });

            const Reddit_Client_Id:string = process.env.REDDIT_CLIENT_ID!;
            const Reddit_Client_Secret:string = process.env.REDDIT_CLIENT_SECRET!;
            const credentials = btoa(`${Reddit_Client_Id}:${Reddit_Client_Secret}`);
            if( !Reddit_Client_Id || !Reddit_Client_Secret ) throw new Error('new credentials are not valid')

            const options = { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'LinnkedOut/1.0',
                    'Authorization': `Basic ${credentials}`                  
                },
                body: bodyData.toString()
            };

            const response:Response = await utility.apicaller(REDDIT_BEARER_TOKEN_ENDPOINT,options);
            if (!response.ok) {
             const errorText = await response.text();
                throw new Error(`Reddit API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
            }

            const data = await response.json();
            if (!data.access_token) {
                throw new Error('No access token received from Reddit API');
            }

            const expiresIn = data.expires_in || 3600;
            return {
                access_token: data.access_token,
                expires_in: Date.now() + (expiresIn * 1000)
            };
        } catch(error:any){
            throw new Error('Error while getting token',error)
        }
    }
    
    
    private async getStoredToken(): Promise<RedditBearerApiEndpointResponse | null> {
       try{
            const token = await this.redis.get(this.tokenKey);
            return token ? JSON.parse(token) : null;
        } catch(error){
            console.log('Unable to fetch token', error);
            throw error;
        }
    }
    
    private async storeToken(tokenData: RedditBearerApiEndpointResponse): Promise<void> {
        try {
            const ttl = Math.max(Math.floor((tokenData.expires_in - Date.now()) / 1000), 60);
            console.log(`TTL: ${ttl}`)
            await this.redis.setex(this.tokenKey, ttl, JSON.stringify(tokenData));
            console.log(`Token stored in Redis with TTL: ${ttl} seconds`);
        } catch (error) {
            console.error('Error storing token in Redis:', error);
            throw error;
        }
    }

    private validateCredentials(): void {
        try{
            const requiredEnvVars = [
                'REDDIT_CLIENT_ID',
                'REDDIT_CLIENT_SECRET',
                'REDDIT_USERNAME',
                'REDDIT_PASSWORD'
            ];
    
            for (const envVar of requiredEnvVars) {
                if (!process.env[envVar]) {
                    throw new Error(`Missing required environment variable: ${envVar}`);
                }
            }
        } catch(error){
            console.log('The environment variables are not valid!', error)
            throw error;
        }
    }
}
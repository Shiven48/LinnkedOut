import { utility } from "@/services/common/utils";

export class RedditAPIService {
    private redditAuthToken: string;

    constructor() {
        if (!process.env.REDDIT_BEARER_TOKEN) throw new Error('Reddit bearer token is missing from environment variables')
        this.redditAuthToken = process.env.REDDIT_BEARER_TOKEN;
    }

    parseRedditUrlForId(embeddedLink: string): string {
        try {
            if (!embeddedLink) throw new Error('The link cannot be null')

            const pathnameParts = new URL(embeddedLink).pathname.split('/').filter(parts => parts.length > 0)
            if (pathnameParts.length >= 2) {

                // /r/subreddit/s/POST_ID/
                if (pathnameParts[0] === 'r' && pathnameParts.length >= 4) {
                    if (pathnameParts[2] === 'comments' || pathnameParts[2] === 's') {
                        return pathnameParts[3].trim();
                    }
                }

                // /comments/1htzxhh
                else if (pathnameParts[0] === 'comments' && pathnameParts.length >= 2) {
                    return pathnameParts[1].trim();
                }
            }

            throw new Error('Invalid URL format');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Failed to parse Reddit embedded link:', errorMessage)
            throw error;
        }
    }

    parseRedditUrlForSubreddit = (url: string): string => {
        try {
            if (!url) throw new Error('The url is not valid!')
            const urlObj = new URL(url);

            if (!urlObj.hostname.includes('reddit.com')) throw new Error('RedditAPIService: The url is not properly formatted for host')
            const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
            if (pathSegments.length >= 2 && pathSegments[0].toLowerCase() === 'r') {
                return pathSegments[1];
            }

            throw new Error('Invalid URL format');
        } catch (error) {
            console.error('Error parsing Reddit URL:', error);
            throw error;
        }
    }

    async fetchVideoMetadata(subreddit: string, redditId: string):Promise<any> {
        try {
            // if(tokenIsEpired(this.redditAuthToken)) throw new Error('Token is expired!')

            const url = `https://oauth.reddit.com/r/${subreddit}/comments/${redditId}.json`;
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.redditAuthToken}`,
                },
            }
            const fetchedRedditPost: any = await utility.apicaller(url, options, 5, 1000);

            if (!fetchedRedditPost.ok) {
                const errorBody = await fetchedRedditPost.text();
                console.error('Reddit API error details:', {
                    status: fetchedRedditPost.status,
                    statusText: fetchedRedditPost.statusText,
                    body: errorBody,
                });
                throw new Error(`Reddit API error: ${fetchedRedditPost.status} ${fetchedRedditPost.statusText}. Details: ${errorBody}`);
            }

            const fetchedRedditMetaData = await fetchedRedditPost.json();
            if (!fetchedRedditMetaData || fetchedRedditMetaData === 'undefined') throw new Error('No data found in the Reddit response'); 
            return fetchedRedditMetaData;
        } catch (error) {
            console.error('Error fetching YouTube metadata:', error);
            throw error;
        }
    }

    async fetchMultipleRDTVideosFromQuery(query: string): Promise<any[]> {
    try {
        const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&limit=20&sort=relevance&type=link&restrict_sr=false`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.redditAuthToken}`,
            },
        }
        const fetchedRedditPost: any = await utility.apicaller(url, options, 5, 1000);
        if (!fetchedRedditPost.ok) {
            const errorBody = await fetchedRedditPost.text();
            console.error('Reddit API error details:', {
                status: fetchedRedditPost.status,
                statusText: fetchedRedditPost.statusText,
                body: errorBody,
            });
            throw new Error(`Reddit API error: ${fetchedRedditPost.status} ${fetchedRedditPost.statusText}. Details: ${errorBody}`);
        }
        const fetchedRedditMetaData = await fetchedRedditPost.json();
        if (!fetchedRedditMetaData || !fetchedRedditMetaData.data || !fetchedRedditMetaData.data.children) throw new Error('Invalid reddit api structure');
       
        const posts = fetchedRedditMetaData.data.children;
        if(!Array.isArray(posts) || posts.length === 0){
            throw new Error(`No posts found in Reddit Response`)
        }        
        return posts.map((post: any) => post.data);
    } catch(error: any){
        console.error(error);
        throw error;
    }
}

    async fetchCommentsFromIds(ids: string[]) {
        const commentPromises = ids.map(async (postId:String) => {
            const url = `https://oauth.reddit.com/comments/${postId}.json`;
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.redditAuthToken}`,
                },
            }
            const fetchedRedditPost: any = await utility.apicaller(url, options, 5, 1000);  
            console.log(`Called the reddit comments api`)

            if (!fetchedRedditPost.ok) {
                const errorBody = await fetchedRedditPost.text();
                console.error('Reddit API error details:', {
                    status: fetchedRedditPost.status,
                    statusText: fetchedRedditPost.statusText,
                    body: errorBody,
                });
                throw new Error(`Reddit API error: ${fetchedRedditPost.status} ${fetchedRedditPost.statusText}. Details: ${errorBody}`);
            }
            const fetchedRedditMetaData = await fetchedRedditPost.json();
            if (!fetchedRedditMetaData || fetchedRedditMetaData === 'undefined') throw new Error('No data found in the Reddit response');
            return fetchedRedditMetaData;
        })
        return await Promise.all(commentPromises);
    }
}
import { utility } from "../../common/utils";
import { YOUTUBE_BASE_URL } from "../../common/constants";
import { YoutubeMetadata, YouTubeVideoResponse } from "@/services/common/types";

export class YoutubeAPIService {
    private apikey:string;
    private readonly YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

    constructor(){
        if(!process.env.YOUTUBE_API_KEY){
            throw new Error('Youtube API key is missing from environment variables');
        }
        this.apikey = process.env.YOUTUBE_API_KEY;
    }

    // parsing id from url
    public parseVideoId(url:string): string {
        try{
            if (!process.env.YOUTUBE_API_KEY) throw new Error('parseVideoId: Unable to fetch environment keys');
            const videoId:string | null = this.parseYoutubeEmbeddedLink(url);
            if (
                !videoId || 
                typeof videoId !== 'string' || 
                videoId === undefined || 
                videoId === null
            ) {
                throw new Error('The videoid is not valid');
            }
            return videoId;
        } catch(error){
            console.error(`Error parsing youtube link`,error)
            throw error;
        }
    }

    public parseYoutubeEmbeddedLink(link: string): string | null {
        try {
            if(!link) throw new Error('Invalid link')
            const url = new URL(link);
            
            // Handle youtube.com domain links
            if (url.hostname.includes('youtube.com')) {
                if(url.searchParams.has('v')){
                    return url.searchParams.get('v')
                }
                else if(url.pathname.includes('shorts')){
                    const pathParts = url.pathname.split('/');
                    return pathParts.length > 2 ? pathParts[2] : null;
                }
                return null;
            }
            // Handle youtu.be short links
            else if (url.hostname === 'youtu.be') {
                const pathParts = url.pathname.split('/');
                return pathParts.length > 1 ? pathParts[1] : null;
            }

            throw new Error('HelperFuncs: The link format is unrecognizable');
        } catch (error) {
            throw error;
        }
    }

    // fetching metadata using v3 api(Single Video)
    public async fetchVideoMetadata(videoId: string):Promise<YoutubeMetadata> {
    try {
        const url = `${YOUTUBE_BASE_URL}?part=snippet,contentDetails,statistics,topicDetails&fields=items(id,snippet(title,description,thumbnails(default(url,width,height),medium(url,width,height),high(url,width,height),standard(url,width,height),maxres(url,width,height)),tags,categoryId),contentDetails(duration,definition,caption),statistics(viewCount,likeCount,favoriteCount,commentCount),topicDetails(topicCategories))&id=${videoId}&key=${this.apikey}`;
        
        const options = { 
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json' 
            },
        }
        const response:any = await utility.apicaller(url, options, 5, 1000);
        if (!response.ok) throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        const data:YouTubeVideoResponse = await response.json();
        if (!data.items || data.items.length === 0) throw new Error('No video data found in the YouTube response');
        return data.items[0];
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      throw error;
    }
    }

    public async searchVideos(query: string, categoryId?:string, topicId?: string): Promise<YoutubeMetadata[]> {
        const params = new URLSearchParams({
                part: 'snippet',
                q: query,
                type: 'video',
                videoDuration: 'medium',
                order: 'relevance',
                maxResults: '20',
                key: this.apikey!
        });
        if (categoryId) {
            params.append('videoCategoryId', categoryId);
        }
        if (topicId) {
            params.append('topicId', topicId);
        }

        console.log('🔍 Search URL:', `${this.YOUTUBE_SEARCH_URL}?${params.toString()}`);
        const response = await utility.apicaller(`${this.YOUTUBE_SEARCH_URL}?${params.toString()}`, { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' }
        }, 5, 1000);
        
        const data = await response.json();        
        if (data.error) {
            console.error('Search API Error:', data.error);
            return [];
        }
        
        const videoIds:string[] = data.items?.map((item: any) => item.id.videoId) || [];
        return this.getAllVideosByID(videoIds);
    }

    // fetching metadata using v3 api(Multiple videos)
    public async getAllVideosByID(videoIds: string[]): Promise<YoutubeMetadata[]> {
        if (videoIds.length === 0) return [];
        
        const detailsUrl = `${YOUTUBE_BASE_URL}?id=${videoIds.join(',')}&part=contentDetails,snippet,statistics,topicDetails&fields=items(id,snippet(title,description,thumbnails(default(url,width,height),medium(url,width,height),high(url,width,height),standard(url,width,height),maxres(url,width,height)),tags,categoryId),contentDetails(duration,definition,caption),statistics(viewCount,likeCount,favoriteCount,commentCount),topicDetails(topicCategories))&key=${this.apikey}`;
        
        const detailsResponse = await utility.apicaller(detailsUrl, { method: 'GET' }, 5, 1000);
        const detailsData = await detailsResponse.json();
                
        if (detailsData.error) {
            console.error('Videos API Error:', detailsData.error);
            return [];
        }
        
        if (!detailsData.items || !Array.isArray(detailsData.items)) {
            console.warn('No items found in API response');
            return [];
        }

        const videoItems:YoutubeMetadata[] = detailsData.items
        return videoItems;
    }

    public async testSimpleSearch(query: string): Promise<any[]> {
        console.log('🧪 Testing simple search for:', query);
        
        const params = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            videoDuration: 'medium',
            maxResults: '10',
            key: this.apikey!
        });

        const searchUrl = `${this.YOUTUBE_SEARCH_URL}?${params.toString()}`;
        console.log('🧪 Simple Search URL:', searchUrl);
        
        const response = await utility.apicaller(searchUrl, { method: 'GET' }, 5, 1000);
        const data = await response.json();
        
        console.log('🧪 Simple Search Response:', data);
        
        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map((item: any) => item.id.videoId);
            console.log('🧪 Video IDs found:', videoIds);
            
            // Get full details
            const videosWithStats = await this.getAllVideosByID(videoIds);
            console.log(`🧪 Got stats for ${videosWithStats.length} videos`);
            return videosWithStats;
        }
        
        return [];
    }

    public async getHighQualityTechContent(query: string): Promise<any[]> {
        console.log('🚀 Starting FIXED search for:', query);
        
        const qualityQueries = [
            `${query} advanced`,
            `${query} deep dive`,
            `${query} expert`
        ];
        
        const allResults: any[] = [];
        
        for (const searchQuery of qualityQueries) {
            console.log(`\n🔍 Searching: "${searchQuery}"`);
            
            const params = new URLSearchParams({
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                videoDuration: 'medium',
                videoDefinition: 'high',
                order: 'rating',
                maxResults: '10',
                key: this.apikey!
            });

            const searchUrl = `${this.YOUTUBE_SEARCH_URL}?${params.toString()}`;
            console.log('🔍 Search URL:', searchUrl);
            
            const response = await utility.apicaller(searchUrl, { method: 'GET' }, 5, 1000);
            const data = await response.json();
            
            console.log('🔍 Search Response:', data);
            
            if (data.items && data.items.length > 0) {
                const videoIds = data.items.map((item: any) => item.id.videoId);
                const videosWithStats = await this.getAllVideosByID(videoIds);
                allResults.push(...videosWithStats); // FIXED: Accumulate all results
                console.log(`✅ Added ${videosWithStats.length} videos from this search`);
            }
        }
        
        console.log(`📊 Total videos found: ${allResults.length}`);
        
        // Remove duplicates by video ID
        const uniqueResults = allResults.filter((video, index, self) => 
            index === self.findIndex(v => v.id === video.id)
        );
        
        console.log(`📊 Unique videos after deduplication: ${uniqueResults.length}`);
        return uniqueResults;
    }

    public processStatistics(apiResponse: any): any[] {
        const processedVideos = apiResponse.items.map((video: any) => {
            // Calculate engagement metrics
            const stats = video.statistics || {};
            const views = parseInt(stats.viewCount || '0');
            const likes = parseInt(stats.likeCount || '0');
            const comments = parseInt(stats.commentCount || '0');
            
            // Calculate quality metrics
            const likeToViewRatio = views > 0 ? (likes / views) * 100 : 0;
            const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
            const commentToLikeRatio = likes > 0 ? comments / likes : 0;
            
            return {
                ...video,
                qualityMetrics: {
                    likeToViewRatio,
                    engagementRate,
                    commentToLikeRatio,
                    views,
                    likes,
                    comments
                }
            };
        });

        console.log(`Processed ${processedVideos.length} videos with quality metrics`);
        return processedVideos;
    }

    // public async fetchMultipleYtVideosFromQuery(query: string): Promise<any> {
    // try {
    //     const searchUrl = `https://www.googleapis.com/youtube/v3/search?type=video&q=${encodeURIComponent(query)}&maxResults=${MEDIA_FETCH_LIMIT}&key=${this.apikey}&part=snippet`;
    //     // const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=skateboarding+dog&type=video&videoDefinition=high&key=${this.apikey}`
    //     const searchOptions = { 
    //         method: 'GET', 
    //         headers: { 
    //             'Content-Type': 'application/json' 
    //         },
    //     };
        
    //     console.log('Searching for videos...');
    //     const searchResponse: any = await utility.apicaller(searchUrl, searchOptions, 5, 1000);
        
    //     if (!searchResponse.ok) {
    //         throw new Error(`YouTube Search API error: ${searchResponse.status} ${searchResponse.statusText}`);
    //     }
        
    //     const searchData = await searchResponse.json();
    //     if (!searchData.items || searchData.items.length === 0) {
    //         throw new Error('No videos found for the search query');
    //     }
    //     console.log(`Found ${searchData.items.length} videos`);
        
    //     const videoIds: string[] = searchData.items.map((item: any) => item.id.videoId);
    //     console.log('Video IDs:', videoIds);
        
    //     console.log('Fetching detailed video data in parallel...');
    //     const videoDataPromises = videoIds.map(videoId => this.fetchVideoMetadata(videoId));
    //     const detailedVideos = await Promise.all(videoDataPromises);
        
    //     return detailedVideos;        
    // } catch (error) {
    //     console.error('Error in fetchMultipleYtVideosFromQuery:', error);
    //     throw error;
    // }
    // }

}
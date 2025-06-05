import { HelperFunctions  } from "@/lib/helper_funcs";
import { utility } from "../../common/utils";
import { YOUTUBE_BASE_URL } from "../../common/constants";

export class YoutubeAPIService {
    private apikey:string;

    constructor(){
        if(!process.env.YOUTUBE_API_KEY){
            throw new Error('Youtube API key is missing from environment variables');
        }
        this.apikey = process.env.YOUTUBE_API_KEY;
    }

    // parsing id from url
    public parseVideoId(url:string): string {
        try{
            const videoId:string | null = HelperFunctions.parseYoutubeEmbeddedLink(url);
            if (!videoId || typeof videoId !== 'string' || videoId === undefined) {
                throw new Error('parseVideoId: The videoid is not acceptable');
            }
            if (!process.env.YOUTUBE_API_KEY) {
                throw new Error('parseVideoId: Unable to fetch environment keys');
            }
            return videoId;
        } catch(error){
            throw error;
        }
    }

    // fetching metadata using v3 api
    public async fetchVideoMetadata(videoId: string) {
    try {
        const url = `${YOUTUBE_BASE_URL}?id=${videoId}&key=${this.apikey}&part=snippet,contentDetails,statistics,status`;
        const options = { 
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json' 
            } 
        }
        
        const response:any = await utility.apicaller(url,options);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }
      
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            throw new Error('No video data found in the YouTube response');
        }
        
        return data.items[0];
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      throw error;
    }
  }

}
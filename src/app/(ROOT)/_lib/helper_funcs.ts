import { fetchVideoFromYoutubeURL } from "@/src/services/youtubeService";
import { Helper } from "./helper_data";

export class HelperFunctions{

    // Here the bot will give the url
    public static async fetchVideoFromBot(){
        const link:string = 'someURL'
        return () => fetchVideoFromYoutubeURL(link);
    }

    public static parseYoutubeEmbeddedLink(link:string){
        // change here -> currently i am using data that i have declared not using the data provided by the bot 
        const url = new URL(Helper.Resources()[0].link).pathname
        const trimmedUrl = url.trim()
        return trimmedUrl.split('/')[1]
    }

    public static parseTwitterEmbeddedLink(link:string) {
        if(!link) throw new Error('Cannot parse the url check the url again')
        return new URL(link).pathname
                .split('/')
                .pop()
                ?.trim()                 
    }

    public static youtubeVideoDetails(id:string){
        return `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
    }

    public static youtubeVideo(id:string){
        return `https://www.youtube.com/embed/${id}` 
    }
}
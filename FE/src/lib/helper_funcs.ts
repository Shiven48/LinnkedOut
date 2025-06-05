import { Media } from '@/services/common/types';
import YoutubeOrchestrator from "@/services/orchestrators/YoutubeOrchestrator";
// import { exec } from "child_process"

export class HelperFunctions {

    // Here the bot will give the url
    public static async fetchVideoFromBot() {
        const link: string = 'someURL'
        const youtubeOrchestrator = new YoutubeOrchestrator();
        return () => youtubeOrchestrator.mainYoutubeOrchestrator(link);
    }

    // change here -> currently i am using data that i have declared, and not the data provided by the bot 
    public static parseYoutubeEmbeddedLink(link: string): string | null {
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

    public static getIdOfplatform = (media: Media):number => {
            if(!media || media === undefined || media === null){
                throw new Error('Media is empty or not an acceptable value')
            }
            if(media.youtubeId === undefined){
                throw new Error('YoutubeId is null or not an acceptable value')
            }
            if(media.redditId === undefined){
                throw new Error('redditId is null or not an acceptable value')
            }
            const platform = media.platform.toLowerCase().trim();
            if(!platform || platform === null){
                throw new Error('Platform is null or empty')
            }
            let platformId:number = 0;
            if(platform === 'youtube' && media.youtubeId){
                platformId = media.youtubeId;
            }
            else if(platform === 'reddit' && media.redditId){
                platformId = media.redditId;
            }

            if(platformId === 0){
                throw Error('Not assigned any id see the issue properly!!');
            }
            return platformId;
  }

    // This is to download the audio source file
    // public static accessDLP(videoId:string) {
    //     exec(`yt-dlp -x --audio-format mp3 -o "output_audio.mp3" https://www.youtube.com/watch?v=${videoId}`, (error:Error, stdout:any, stderr:any) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.error(`stderr: ${stderr}`);
    //         return;
    //     }
    //         console.log(`stdout: ${stdout}`);
    //     });
    // }
}
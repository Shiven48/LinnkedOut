import { fetchVideoFromYoutubeURL } from "../../../src/services/youtubeService";
import { Helper } from "./helper_data";
const { exec } = require('child_process');

export class HelperFunctions {

    // Here the bot will give the url
    public static async fetchVideoFromBot() {
        const link: string = 'someURL'
        return () => fetchVideoFromYoutubeURL(link);
    }

    // change here -> currently i am using data that i have declared, but not the data provided by the bot 
    public static parseYoutubeEmbeddedLink(link: string): string | null {
        try {
            if(!link){
                throw new Error('Invalid link')
            }
            const url = new URL(link);
            
            // Handle youtube.com domain links
            if (url.hostname.includes('youtube.com')) {
                return url.searchParams.get('v') || null;
            }
            // Handle youtu.be short links
            else if (url.hostname === 'youtu.be') {
                const pathParts = url.pathname.split('/');
                return pathParts.length > 1 ? pathParts[1] : null;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    public static parseTwitterEmbeddedLink(link: string) {
        if (!link) throw new Error('Cannot parse the url check the url again')
        return new URL(link).pathname
            .split('/')
            .pop()
            ?.trim()
    }

    public static parseRedditEmbeddedLink(embeddedLink: string): string {
        if (!embeddedLink) throw new Error('The link cannot be null')
        try {
            const pathnameParts = new URL(embeddedLink).pathname.split('/').filter(parts => parts.length > 0)
            if (pathnameParts.length >= 2) {

                // /r/Azoozkie/comments/1htzxhh/  OR  /r/subreddit/s/POST_ID/
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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to parse Reddit embedded link: ${errorMessage}`);
        }
    }

    public static accessDLP(videoId:string) {
        exec(`yt-dlp -x --audio-format mp3 -o "output_audio.mp3" https://www.youtube.com/watch?v=${videoId}`, (error:Error, stdout:any, stderr:any) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
            console.log(`stdout: ${stdout}`);
        });
    }
}
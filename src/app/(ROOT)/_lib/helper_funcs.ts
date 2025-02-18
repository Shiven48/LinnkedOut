import { Helper } from "./helper_data";

export class HelperFunctions{

    public static parseYoutubeEmbeddedLink(link:string){
        const url = new URL(Helper.Resources()[0].link).pathname
        const trimmedUrl = url.trim()
        // This would be the splitted portions of url -> 'https://youtu.be' 'ECycCnPy1Qw'
        return trimmedUrl.split('/')[1]
    }

    public static async fetchData() {
        const videoId = HelperFunctions.parseYoutubeEmbeddedLink(Helper.Resources()[0].link)
        const response = await fetch(`/api/hello/${videoId}`);
        if (response.ok) {
            return await response.json();
        }
    }
    
    public static async postDataInDB(data:any) {
        try{
            console.log('Posted Data in database')
        } catch(error){
            console.error(error)
        }
    }

    public static async fetchURL(){
        // Here the bot will give me the url
        const link:string = 'someURL'
        const videoId = HelperFunctions.parseYoutubeEmbeddedLink(link)
        return videoId
    }
}
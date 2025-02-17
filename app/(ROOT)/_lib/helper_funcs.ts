import { Helper } from "./helper_data";

export class HelperFunctions{
    public static parseYoutubeEmbeddedLink(link:string){
        const url = new URL(Helper.Resources()[0].link).pathname
        const trimmedUrl = url.trim()
        // This would be the splitted portions of url -> 'https://youtu.be' 'ECycCnPy1Qw'
        return trimmedUrl.split('/')[1]
    }
}
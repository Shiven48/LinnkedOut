import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { Media } from '@/services/common/types';
import { SummaryService } from '@/services/content/summaryService';
import RedditOrchestrator from '@/services/orchestrators/RedditOrchestrator';
import YoutubeOrchestrator from "@/services/orchestrators/YoutubeOrchestrator";

export class HelperFunctions {

    // Here the bot will give the url
    public static async fetchVideoFromBot() {
        const link: string = 'someURL'
        const youtubeOrchestrator = new YoutubeOrchestrator();
        return () => youtubeOrchestrator.mainYoutubeOrchestrator(link);
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

    static async PipelineInitializer(data:FormDataType){
        const { url:links, category, customTags, fetchSimilar, similarityLevel } = data;
        const summaryService = new SummaryService();
        await this.parseLinksForPlatform(links);

        // For tags query generation
        // const result:string = await summaryService.generateSearchQuery(category, customTags, similarityLevel);
    }

    public static async parseLinksForPlatform(links: string[]) {
        try{
            if(links && links.length >= 1){
                if(links.length === 1) {
                    await this.OrchestratorCaller(links[0]);
                }
                else if(links.length > 1) {
                    const orchestratorCalls:Promise<any>[] = links.map((link: string) =>
                        this.OrchestratorCaller(link)
                    );
                    const results = await Promise.allSettled(orchestratorCalls);

                    results.forEach((result, index) => {
                        if (result.status === "fulfilled") {
                        console.log(`Link ${links[index]} processed successfully.`);
                        } else {
                        console.error(`Link ${links[index]} failed:`, result.reason);
                        }
                    });
                }
            }
        } catch(error){
            console.error(`Unable to fetch platfrom type from link`,error)
            throw error;
        }
    }

    static async OrchestratorCaller(link: string): Promise<any>{
        if(link.includes(`youtube`) || link.includes(`youtu.be`)){
            const youtubeOrchestrator:YoutubeOrchestrator = new YoutubeOrchestrator(); 
            // await youtubeOrchestrator.mainYoutubeOrchestrator(link)
        }
        else if(link.includes('www.reddit.com/r') || link.includes(`reddit`)){
            const redditOrchestrator:RedditOrchestrator = new RedditOrchestrator();
            // await redditOrchestrator.mainRedditOrchestrator(link);
        }
    }
}
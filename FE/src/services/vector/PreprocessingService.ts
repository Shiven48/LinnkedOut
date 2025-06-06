import { Media } from "../common/types";
import { RedditMetadataSevice } from "@/services/Platform/reddit/RedditMetadataService";
import { YoutubeTranscriptService } from "../Platform/youtube/YoutubeTranscriptionService";
import natural from 'natural';
import stopwords from 'stopwords-iso';

export class ProcessingService {

  private youtubeTranscriptionService:YoutubeTranscriptService;
  private redditMetaDataService:RedditMetadataSevice;
  
  constructor(){
    this.youtubeTranscriptionService = new YoutubeTranscriptService();
    this.redditMetaDataService = new RedditMetadataSevice(); 
  }
      
  public extractAndPreprocessData(mediaData: Media, platformData: any):string {
    let textSources = [];
    
    try {
      if (mediaData?.title) {
        textSources.push(mediaData.title);
      }
    
      if (platformData?.description) {
        textSources.push(platformData.description);
      }
    
      if (platformData?.englishCaptions) {
        const extractedCaptions = this.youtubeTranscriptionService.extractEnglishCaptions(platformData.englishCaptions);
        textSources.push(extractedCaptions);
      }

      // This will be solved with redditOrchestrator
      if(platformData?.comments) {
          const extractedComments:string = this.redditMetaDataService.extractComments(platformData.comments);
          textSources.push(extractedComments)
      }

      let unifiedText:string = textSources.join(' ');
      unifiedText = this.cleanText(unifiedText);
      unifiedText = unifiedText.slice(0, 1000);

      if (!unifiedText || 
          typeof unifiedText !== 'string' || 
          unifiedText === undefined ||
          unifiedText.length <= 0
        ) {
          throw new Error("Preprocessing failed: content is undefined or empty");
        }
      
      return unifiedText;
    } catch (error) {
      console.error('PreprocessingService: Error while preprocessing content',error)
      throw error;
    } 
  }
    
  private cleanText(text: string): string {
      let cleaned = text.toLowerCase().replace(/https?:\/\/\S+/g, '');
      
      // Tokenize
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(cleaned);
      
      // Removing stopwords, emoji, and special characters
      const combinedStopwords = [...stopwords.en, ...stopwords.hi];
      const filteredTokens = tokens.filter(token => 
        !combinedStopwords.includes(token) && 
        token.length > 1 && 
        !/[^\x00-\x7F]+/.test(token) &&
        !/^\d+$/.test(token)
      );
      
      return filteredTokens.join(' ');
  }
    
}
import { TranscriptResponse, YoutubeTranscript} from 'youtube-transcript'
import { CaptionItem } from '@/services/common/types'

export class YoutubeTranscriptService {

    public async fetchTranscript(videoId: string): Promise<TranscriptResponse[]> {
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      return transcriptItems;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Transcript is disabled')) {
        console.error('Transcripts are disabled for this video');
        return [];
      } else {
        throw error;
      }
    }
  }

  public extractEnglishCaptions(transcriptItems: TranscriptResponse[]): CaptionItem[] {
    try {
      const enTranscripts: CaptionItem[] = transcriptItems.filter((item: any): item is CaptionItem =>
        item.lang !== undefined && item.lang === 'en');

      if (enTranscripts.length === 0) {
        console.error('No English transcripts found, returning empty result');
        return [];
      }

      const formattedTranscripts: CaptionItem[] = enTranscripts.map((item) => ({
        text: item.text,
        lang: item.lang,
        offset: item.offset,
        duration: item.duration
      }));

      return formattedTranscripts;
    } catch (error) {
      console.error('Error processing transcripts:', error);
      throw error;
    }
  }

  public extractCaptionText(captions: CaptionItem[]): string {
    return captions.map(caption => caption.text).join(' ');
  }

}
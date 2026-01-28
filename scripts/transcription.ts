import { YtDlp } from 'ytdlp-nodejs';
import * as https from 'https';

const VIDEO_URL = 'https://www.youtube.com/watch?v=CBCujAQtdfQ';
const SUBTITLE_LANG = 'en';

function downloadFromUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function extractTextFromJson3(json3Data: any): string[] {
    const transcriptTexts: string[] = [];
    
    if (json3Data.events) {
        for (const event of json3Data.events) {
            if (event.segs) {
                const eventText = event.segs
                    .map((seg: any) => seg.utf8 || '')
                    .join('')
                    .trim();
                
                if (eventText) {
                    transcriptTexts.push(eventText);
                }
            }
        }
    }
    
    return transcriptTexts;
}

async function processVideoSubtitles() {
    try {
        console.log(`[1/3] Fetching video metadata...`);
        const ytdlp = new YtDlp();
        const metadata: any = await ytdlp.getInfoAsync(VIDEO_URL);

        console.log(`[2/3] Finding transcript URL...`);
        const subtitleInfo = metadata.automatic_captions?.[SUBTITLE_LANG];
        
        // Find the json3 format URL
        const json3Subtitle = subtitleInfo?.find((sub: any) => sub.ext === 'json3');
        
        if (!json3Subtitle || !json3Subtitle.url) {
            throw new Error(`Could not find json3 format transcript for language '${SUBTITLE_LANG}'.`);
        }
        
        const transcriptUrl = json3Subtitle.url;
        console.log(`      Found transcript URL.`);

        console.log(`[3/3] Downloading and parsing transcript...`);
        const rawResponse = await downloadFromUrl(transcriptUrl);
        
        const json3Data = JSON.parse(rawResponse);
        const transcriptTexts = extractTextFromJson3(json3Data);        
        console.log(`      Total transcript segments: ${transcriptTexts.length}`);
        console.log(transcriptTexts);
    } catch (error) {
        console.error("\n--- An error occurred during the process ---");
        console.error(error);
    }
}

processVideoSubtitles();
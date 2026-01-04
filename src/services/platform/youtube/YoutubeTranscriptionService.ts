import { TranscriptResponse, YoutubeTranscript } from 'youtube-transcript'
import { CaptionItem, WhisperJsonFile, WhisperSegment } from '@/services/common/types'
import { spawn } from 'child_process';
import { Audio_Output_Directory } from '@/services/common/constants';
import fs from "fs"
import path from 'path';
import YTDlpWrap from 'yt-dlp-wrap';
import * as https from 'https';

interface YtDlpSubtitle {
  ext?: string;
  url?: string;
}

interface YtDlpMetadata {
  subtitles?: Record<string, YtDlpSubtitle[]>;
  automatic_captions?: Record<string, YtDlpSubtitle[]>;
}

interface Json3Seg {
  utf8?: string;
}

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: Json3Seg[];
}

interface Json3Data {
  events?: Json3Event[];
}

export class YoutubeTranscriptService {
  private ytdlp: YTDlpWrap | null = null;
  private isYtdlpReady = false;
  private binaryPath = path.join(process.cwd(), 'temp', 'yt-dlp');

  constructor() {
    this.ensureYtdlp();
  }

  private async ensureYtdlp() {
    try {
      if (this.isYtdlpReady && this.ytdlp) return;

      const tempDir = path.dirname(this.binaryPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      if (!fs.existsSync(this.binaryPath)) {
        console.log('[YoutubeTranscriptService] yt-dlp binary not found, attempting to download...');
        await YTDlpWrap.downloadFromGithub(this.binaryPath);
        fs.chmodSync(this.binaryPath, 0o755);
        console.log('[YoutubeTranscriptService] yt-dlp binary downloaded successfully.');
      }
      
      this.ytdlp = new YTDlpWrap(this.binaryPath);
      this.isYtdlpReady = true;
    } catch (error) {
      console.error('[YoutubeTranscriptService] Failed to ensure yt-dlp binary:', error);
    }
  }

  public async fetchTranscript(videoId: string, _title?: string): Promise<CaptionItem[]> {
    let transcript: CaptionItem[] = [];
    try {
      console.log(`[YoutubeTranscriptService] [${videoId}] Fetching transcripts...`);

      if(!_title) {
        console.warn(`[YoutubeTranscriptService] [${videoId}] No title provided.`);
      }
      
      // 1. Primary method: Using ytdlp-nodejs to get json3 transcripts (most reliable)
      transcript = await this.fetchTranscriptViaYtDlp(videoId);
      if (transcript && transcript.length > 0) {
        console.log(`[YoutubeTranscriptService] [${videoId}] Successfully fetched ${transcript.length} transcripts via YtDlp (json3).`);
        return transcript;
      }

      // 2. Secondary method: Falling back to youtube-transcript package
      console.log(`[YoutubeTranscriptService] [${videoId}] YtDlp returned empty, falling back to youtube-transcript package...`);
      try {
        const transcriptItems: TranscriptResponse[] = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcriptItems && transcriptItems.length > 0) {
          console.log(`[YoutubeTranscriptService] [${videoId}] ✅ Found ${transcriptItems.length} transcripts via youtube-transcript.`);
          transcript = this.extractEnglishCaptions(transcriptItems);
        }
      } catch (ytError) {
        console.warn(`[YoutubeTranscriptService] [${videoId}] youtube-transcript package failed:`, ytError);
      }
      return transcript;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Transcript is disabled')) {
        console.error('[YoutubeTranscriptService] Transcripts are disabled for this video');
        return [];
      } 
      console.error('[YoutubeTranscriptService] Error during transcript fetch:', error);
      // Final attempt with whisper if everything else fails with an error
      // try {
      //   return await this.generateTranscriptsFromAudio(videoId, title);
      // } catch (whisperError) {
      //   console.error('[YoutubeTranscriptService] Whisper generation also failed:', whisperError);
      //   return [];
      // }
      return [];
    }
  }

  private async fetchTranscriptViaYtDlp(videoId: string): Promise<CaptionItem[]> {
    await this.ensureYtdlp();
    if (!this.ytdlp) {
      console.warn(`[YtDlp] [${videoId}] yt-dlp not initialized`);
      return [];
    }

    try {
      const VIDEO_URL = `https://www.youtube.com/watch?v=${videoId}`;
      const SUBTITLE_LANG = 'en';
      
      const metadataStr = await this.ytdlp.execPromise([
        VIDEO_URL,
        '--dump-json',
        '--skip-download',
        '--extractor-args', 'youtube:player_client=android',
        '--extractor-args', 'youtube:player_skip=webpage,configs,js',
        '--js-runtimes', 'node',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      ]);
      
      const metadata = JSON.parse(metadataStr) as YtDlpMetadata;
      
      // Look for subtitles or automatic captions in English
      const subtitleInfo = metadata.subtitles?.[SUBTITLE_LANG] || metadata.automatic_captions?.[SUBTITLE_LANG];
      
      if (!subtitleInfo) {
        console.warn(`[YtDlp] [${videoId}] No English subtitles or automatic captions found`);
        return [];
      }
      
      // Find the json3 format URL
      const json3Subtitle = subtitleInfo.find((sub: YtDlpSubtitle) => sub.ext === 'json3');
      
      if (!json3Subtitle || !json3Subtitle.url) {
        console.warn(`[YtDlp] [${videoId}] No json3 format found in subtitles. Available formats: ${subtitleInfo.map((s: YtDlpSubtitle) => s.ext).join(', ')}`);
        return [];
      }
      
      const transcriptUrl = json3Subtitle.url;
      const rawResponse = await this.downloadFromUrl(transcriptUrl);
      
      if (rawResponse.trim().startsWith('<html>')) {
        console.warn(`[YtDlp] [${videoId}] Received HTML instead of JSON for transcript`);
        return [];
      }

      try {
        const json3Data = JSON.parse(rawResponse) as Json3Data;
        const parsedTranscripts = this.parseJson3Transcript(json3Data, SUBTITLE_LANG);
        console.log(`[YtDlp] [${videoId}] Parsed ${parsedTranscripts.length} transcript segments from json3`);
        return parsedTranscripts;
      } catch (parseError) {
        console.error(`[YtDlp] [${videoId}] Failed to parse transcript JSON:`, parseError);
        return [];
      }
    } catch (error) {
      console.error(`[YtDlp] [${videoId}] Method failed:`, error);
      return [];
    }
  }

  private downloadFromUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };
      https.get(url, options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => { resolve(data); });
      }).on('error', (error) => { reject(error); });
    });
  }

  private parseJson3Transcript(json3Data: Json3Data, lang: string): CaptionItem[] {
    const transcriptItems: CaptionItem[] = [];
    if (json3Data.events) {
      for (const event of json3Data.events) {
        if (event.segs) {
          const text = event.segs
            .map((seg: Json3Seg) => seg.utf8 || '')
            .join('')
            .trim();
          
          if (text) {
            transcriptItems.push({
              text: text,
              lang: lang,
              offset: (event.tStartMs || 0) / 1000,
              duration: (event.dDurationMs || 0) / 1000
            });
          }
        }
      }
    }
    return transcriptItems;
  }

  public async generateTranscriptsFromAudio(videoId:string, title:string): Promise<CaptionItem[]>{
    const tempFiles: string[] = [];
    try{
      let audioFilePath: string | null = null;
      let transcriptFilePath: string | null = null;

      console.log(`[Whisper] Downloading Audio for ${videoId}...`);
      audioFilePath = await this.fetchAndSaveAudioFromPlatform(videoId, title);
      tempFiles.push(audioFilePath);
      console.log(`[Whisper] Audio saved: ${path.basename(audioFilePath)}`);
      
      console.log(`[Whisper] Extracting Transcripts using Whisper...`);
      transcriptFilePath = await this.ExtractTranscriptsFromAudio(audioFilePath, title);
      tempFiles.push(transcriptFilePath);
      console.log(`[Whisper] Transcripts generated: ${path.basename(transcriptFilePath)}`);
      
      console.log('[Whisper] Reading transcript file...')
      const transcripts:CaptionItem[] = await this.ReadTranscriptsJsonFile(transcriptFilePath);
      console.log(`[Whisper] Found ${transcripts.length} transcript segments`);

      return transcripts;
    } catch(error){
      console.error('[Whisper] Error during transcript generation:', error);
      throw error;
    } finally {
      await this.cleanUpTemporaryFiles(tempFiles);
    }
  }

  public extractEnglishCaptions(transcriptItems: TranscriptResponse[]): CaptionItem[] {
    try {
      const enTranscripts: TranscriptResponse[] = transcriptItems.filter((item) =>
        item.lang !== undefined && (item.lang === 'en' || item.lang === 'English' || item.lang.startsWith('en')));

      if (enTranscripts.length === 0) {
        return transcriptItems.map(item => ({
            text: item.text,
            lang: item.lang || 'unknown',
            offset: item.offset,
            duration: item.duration
        }));
      }

      const formattedTranscripts: CaptionItem[] = enTranscripts.map((item) => ({
        text: item.text,
        lang: item.lang || 'en',
        offset: item.offset,
        duration: item.duration
      }));

      return formattedTranscripts;
    } catch (error) {
      console.error('Error processing transcripts:', error);
      throw error;
    }
  }

  public async fetchAndSaveAudioFromPlatform(videoId: string, title: string): Promise<string> {
    const extension = `wav`;
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(Audio_Output_Directory)) {
        try {
            fs.mkdirSync(Audio_Output_Directory, { recursive: true });
        } catch {
            // Fallback to a temp directory if the constant one fails (e.g. wrong path)
            const fallbackDir = path.join(process.cwd(), 'temp_audio');
            if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
            const p = path.join(fallbackDir, `${title}.${extension}`);
            this.runYtDlpAudio(videoId, p, extension, resolve, reject).catch(reject);
            return;
        }
      }

      const audioPath = path.join(Audio_Output_Directory, `${title}.${extension}`);
      this.runYtDlpAudio(videoId, audioPath, extension, resolve, reject).catch(reject);
    });
  }

  private async runYtDlpAudio(videoId: string, audioPath: string, extension: string, resolve: (path: string) => void, reject: (err: Error) => void) {
    await this.ensureYtdlp();
    if (!this.ytdlp || !this.isYtdlpReady) {
      return reject(new Error('yt-dlp is not ready'));
    }

    try {
      this.ytdlp.exec([
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', extension,
        '-o', audioPath,
        '--extractor-args', 'youtube:player_client=android',
        '--extractor-args', 'youtube:player_skip=webpage,configs,js'
      ])
      .on('error', (err) => {
        console.error('[YoutubeTranscriptService] yt-dlp error:', err);
        reject(err);
      })
      .on('close', (code) => {
        if (code === 0) {
          resolve(audioPath);
        } else {
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  }

  public async ExtractTranscriptsFromAudio(absoluteAudioFilePath: string, title: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!absoluteAudioFilePath || absoluteAudioFilePath.length <= 0) {
        return reject(new Error(`Audio path is not valid: ${absoluteAudioFilePath}`));
      }

      const whisper = spawn('whisper', [
        absoluteAudioFilePath,
        '--language', 'English',
        '--output_format', 'json',
        '--output_dir', path.dirname(absoluteAudioFilePath)
      ]);

      whisper.stdout.on('data', () => {
        // console.log(`stdout: ${logs.toString()}`);
      });

      whisper.stderr.on('data', () => {
        // console.error(`stderr: ${errorLogs.toString()}`);
      });

      whisper.on('close', (code) => {
        if (code === 0) {
          const audioFileName = path.basename(absoluteAudioFilePath, path.extname(absoluteAudioFilePath));
          const TranscriptFilePath = path.join(path.dirname(absoluteAudioFilePath), `${audioFileName}.json`);
          
          if (fs.existsSync(TranscriptFilePath)) {
            resolve(TranscriptFilePath);
          } else {
            const alternativeFilePath = path.join(path.dirname(absoluteAudioFilePath), `${title}.json`);
            if (fs.existsSync(alternativeFilePath)) {
              resolve(alternativeFilePath);
            } else {
              reject(new Error(`Transcript file not found. Expected: ${TranscriptFilePath} or ${alternativeFilePath}`));
            }
          }
        } else {
          reject(new Error(`whisper exited with code ${code}`));
        }
      });

      whisper.on('error', (error) => {
        reject(new Error(`Failed to start whisper process: ${error.message}`));
      });
    });
  }

  public async cleanUpTemporaryFiles(tempfiles: string[]):Promise<void> {
    const filesToCleanup:string[] = tempfiles.filter(Boolean)

    filesToCleanup.map((filePath:string) => {
      try{
        if(fs.existsSync(filePath)){
          this.DeleteExistingFile(filePath);
          console.log(`cleaned up: ${path.basename(filePath)}`)
        }
      } catch(error){
        console.warn(`⚠️ Could not delete temp file ${filePath}:`, error);
      }
    })
  }

  public async DeleteExistingFile(filePath: string):Promise<void> {
    if (!filePath || filePath.length <= 0 || filePath === undefined) {
      throw new Error(`Audio path is not valid: ${filePath}`);
    }
    console.log(`Deleting the ${path.basename(filePath)} file...`)
    fs.rmSync(filePath);
    console.log(`${filePath} file deleted successfully!`);
  }

  public async ReadTranscriptsJsonFile(JsonFilePath: string): Promise<CaptionItem[]> {
    try{
      const JsonFileData = await fs.promises.readFile(JsonFilePath, {
        encoding: 'utf-8',
        flag: 'r',
      })
      const JsonFile = JSON.parse(JsonFileData);
      return this.parseJsonTranscripts(JsonFile);
    } catch(error){
      throw new Error(`Unable to read the file: ${error}`);
    }
  }

  public parseJsonTranscripts(jsonFile: WhisperJsonFile): CaptionItem[] {
    const { language, segments } = jsonFile;
    const parsedTranscript: CaptionItem[] = segments.map((segment: WhisperSegment) => {
      const { text, start, end } = segment;
      const transcript: CaptionItem = {
        text: text,
        duration: end - start,
        offset: start,
        lang: language
      }
      return transcript;
    })
    return parsedTranscript;
  }

  public extractCaptionText(captions: CaptionItem[]): string {
    return captions.map(caption => caption.text).join(' ');
  }

}
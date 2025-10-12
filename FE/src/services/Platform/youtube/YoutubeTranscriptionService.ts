import { TranscriptResponse, YoutubeTranscript } from "youtube-transcript";
import {
  CaptionItem,
  WhisperJsonFile,
  WhisperSegment,
} from "@/services/common/types";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Audio_Output_Directory } from "@/services/common/constants";
import fs from "fs";
import path from "path";

export class YoutubeTranscriptService {
  public async fetchTranscript(
    videoId: string,
    title: string
  ): Promise<CaptionItem[]> {
    try {
      console.log(
        `[TranscriptService] Fetching transcript for video ID: ${videoId}`
      );
      let transcriptItems: TranscriptResponse[] =
        await YoutubeTranscript.fetchTranscript(videoId);

      console.log(
        `[TranscriptService] Found ${transcriptItems.length} transcript items for ${videoId}.`
      );

      if (transcriptItems && transcriptItems.length > 0) {
        console.log("Found youtube native transcripts.");
        // return this.extractEnglishCaptions(transcriptItems)
      }
      return this.extractEnglishCaptions(transcriptItems);

      // This takes a lot of time
      // console.warn('⚠️ No native transcripts found. Generating transcripts via Whisper...');
      // return await this.generateTranscriptsFromAudio(videoId, title)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Transcript is disabled")
      ) {
        console.error("Transcripts are disabled for this video");
        return [];
      }
      throw error;
    }
  }

  public async generateTranscriptsFromAudio(
    videoId: string,
    title: string
  ): Promise<CaptionItem[]> {
    const tempFiles: string[] = [];
    try {
      let audioFilePath: string | null = null;
      let transcriptFilePath: string | null = null;

      console.log(`Downloading Audio...`);
      audioFilePath = await this.fetchAndSaveAudioFromPlatform(videoId, title);
      tempFiles.push(audioFilePath);
      console.log(`Audio saved: ${path.basename(audioFilePath)}`);

      console.log(`Extracting Transcripts...`);
      transcriptFilePath = await this.ExtractTranscriptsFromAudio(
        audioFilePath,
        title
      );
      tempFiles.push(transcriptFilePath);
      console.log(`Trnscripts geerated: ${path.basename(transcriptFilePath)}`);

      console.log("Reading transcript file...");
      const transcripts: CaptionItem[] = await this.ReadTranscriptsJsonFile(
        transcriptFilePath
      );
      console.log(`Found ${transcripts.length} transcript segments`);

      return transcripts;
    } catch (error) {
      console.error("Error during transcript generation:", error);
      throw error;
    } finally {
      await this.cleanUpTemporaryFiles(tempFiles);
    }
  }

  public extractEnglishCaptions(
    transcriptItems: TranscriptResponse[]
  ): CaptionItem[] {
    try {
      const enTranscripts: CaptionItem[] = transcriptItems.filter(
        (item: any): item is CaptionItem =>
          item.lang !== undefined &&
          (item.lang === "en" || item.lang === "English")
      );

      if (enTranscripts.length === 0) {
        console.error("No English transcripts found, generating transcripts");
        return [];
      }

      const formattedTranscripts: CaptionItem[] = enTranscripts.map((item) => ({
        text: item.text,
        lang: item.lang,
        offset: item.offset,
        duration: item.duration,
      }));

      return formattedTranscripts;
    } catch (error) {
      console.error("Error processing transcripts:", error);
      throw error;
    }
  }

  public async fetchAndSaveAudioFromPlatform(
    videoId: string,
    title: string
  ): Promise<string> {
    const extension = `wav`;
    return new Promise((resolve, reject) => {
      // Getting dir name of the constant audio path
      if (!fs.existsSync(Audio_Output_Directory)) {
        fs.mkdirSync(Audio_Output_Directory, { recursive: true });
      }

      const process: ChildProcessWithoutNullStreams = spawn(`yt-dlp`, [
        "-f",
        "bestaudio",
        "--extract-audio",
        "--audio-format",
        `${extension}`,
        "-o",
        `${path.join(`${Audio_Output_Directory}`, `${title}.${extension}`)}`,
        `${videoId}`,
      ]);

      process.stdout.on("data", (data) => {
        console.log(`stdOut: ${data}`);
      });

      process.stderr.on("data", (data) => {
        console.log(`stdErr: ${data}`);
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve(
            path.join(`${Audio_Output_Directory}`, `${title}.${extension}`)
          );
        } else {
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });
    });
  }

  public async ExtractTranscriptsFromAudio(
    absoluteAudioFilePath: string,
    title: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!absoluteAudioFilePath || absoluteAudioFilePath.length <= 0) {
        return reject(
          new Error(`Audio path is not valid: ${absoluteAudioFilePath}`)
        );
      }

      const whisper = spawn("whisper", [
        absoluteAudioFilePath,
        "--language",
        "English",
        "--output_format",
        "json",
        "--output_dir",
        path.dirname(absoluteAudioFilePath),
      ]);

      whisper.stdout.on("data", (logs) => {
        console.log(`stdout: ${logs.toString()}`);
      });

      whisper.stderr.on("data", (errorLogs) => {
        console.error(`stderr: ${errorLogs.toString()}`);
      });

      whisper.on("close", (code) => {
        if (code === 0) {
          const audioFileName = path.basename(
            absoluteAudioFilePath,
            path.extname(absoluteAudioFilePath)
          );
          const TranscriptFilePath = path.join(
            path.dirname(absoluteAudioFilePath),
            `${audioFileName}.json`
          );

          if (fs.existsSync(TranscriptFilePath)) {
            resolve(TranscriptFilePath);
          } else {
            const alternativeFilePath = path.join(
              path.dirname(absoluteAudioFilePath),
              `${title}.json`
            );
            if (fs.existsSync(alternativeFilePath)) {
              resolve(alternativeFilePath);
            } else {
              reject(
                new Error(
                  `Transcript file not found. Expected: ${TranscriptFilePath} or ${alternativeFilePath}`
                )
              );
            }
          }
        } else {
          reject(new Error(`whisper exited with code ${code}`));
        }
      });

      whisper.on("error", (error) => {
        reject(new Error(`Failed to start whisper process: ${error.message}`));
      });
    });
  }

  public async cleanUpTemporaryFiles(tempfiles: string[]): Promise<void> {
    const filesToCleanup: string[] = tempfiles.filter(Boolean);

    filesToCleanup.map((filePath: string) => {
      try {
        if (fs.existsSync(filePath)) {
          this.DeleteExistingFile(filePath);
          console.log(`cleaned up: ${path.basename(filePath)}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not delete temp file ${filePath}:`, error);
      }
    });
  }

  public async DeleteExistingFile(filePath: string): Promise<void> {
    if (!filePath || filePath.length <= 0 || filePath === undefined) {
      throw new Error(`Audio path is not valid: ${filePath}`);
    }
    console.log(`Deleting the ${path.basename(filePath)} file...`);
    fs.rmSync(filePath);
    console.log(`${filePath} file deleted successfully!`);
  }

  public async ReadTranscriptsJsonFile(
    JsonFilePath: string
  ): Promise<CaptionItem[]> {
    try {
      const JsonFileData = await fs.promises.readFile(JsonFilePath, {
        encoding: "utf-8",
        flag: "r",
      });
      const JsonFile = JSON.parse(JsonFileData);
      return this.parseJsonTranscripts(JsonFile);
    } catch (error) {
      throw new Error(`Unable to read the file: ${error}`);
    }
  }

  public parseJsonTranscripts(jsonFile: WhisperJsonFile): CaptionItem[] {
    const { language, segments } = jsonFile;
    const parsedTranscript: CaptionItem[] = segments.map(
      (segment: WhisperSegment) => {
        const { text, start, end } = segment;
        const transcript: CaptionItem = {
          text: text,
          duration: start,
          offset: end,
          lang: language,
        };
        return transcript;
      }
    );
    return parsedTranscript;
  }

  public extractCaptionText(captions: CaptionItem[]): string {
    return captions.map((caption) => caption.text).join(" ");
  }
}

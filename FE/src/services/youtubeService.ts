import { HelperFunctions } from "@/lib/helper_funcs";
import { CaptionItem, Media, YoutubeMedia } from "../../types";
import { NextResponse } from "next/server";
import { insertMedia, insertYoutubeMedia } from "../server/functions/media";
import { TranscriptResponse, YoutubeTranscript } from 'youtube-transcript';
import { contentVectorStore } from "./contentVectorStore";
import EmbeddingGenerator from "./EmbeddingGeneratorService";
import { Helper } from "@/lib/helper_data";

export const fetchVideoFromYoutubeURL = async (link: string) => {
    try {
        // Preprocessing the link
        const videoId = HelperFunctions.parseYoutubeEmbeddedLink(link);
        if (!videoId) {
            return NextResponse.json({ message: 'Unable to fetch videoId' }, { status: 500 });
        }
        if (!process.env.YOUTUBE_API_KEY) {
            return NextResponse.json({ message: 'Unable to fetch environment keys' }, { status: 400 });
        }

        // Fetching the video from it's extracted ID
        const youtubeKey = process.env.YOUTUBE_API_KEY;
        const fetchedVideo = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeKey}&part=snippet,contentDetails,statistics,status`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!fetchedVideo.ok) return NextResponse.json({ message: 'Unable to fetch video metadata' }, { status: 400 });
        const fetchedYoutubeMetaData = await fetchedVideo.json();

        // Extracting metadata from the fetched video
        const mediaData = await extractMediaData(fetchedYoutubeMetaData);
        const youtubeData = await extractYoutubeData(fetchedYoutubeMetaData);

        // Extracting transcripts of the video
        const transcripts:TranscriptResponse[] = await getTranscript(videoId);
        youtubeData.englishCaptions = getEnglishTranscripts(transcripts);

        // Saving the video embeddings in the database
        const embeddingsId:number = await storeEmbeddings(mediaData, youtubeData)
        if (!embeddingsId) {
            return NextResponse.json({ message: 'Error saving embeddings to the database' }, { status: 500 });
        }

        mediaData.embeddingId = embeddingsId;

        // Saving the video metadata in the database
        const metaDataId:number = await saveToDatabase(mediaData, youtubeData);
        if (metaDataId === undefined || metaDataId === null || isNaN(metaDataId) || metaDataId <= 0) {
            return NextResponse.json({ message: 'Error saving metadata to the database' }, { status: 500 });
        }

        console.log('Inserted all data successfully')
        return { videoMetadataId:metaDataId, embeddingsId: embeddingsId }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};

export const extractMediaData = async (youtubeMetaData: any): Promise<Media> => {
    const { items } = youtubeMetaData;
    const video = items[0];

    if (!video || video.length === 0) {
        throw new Error('No video data found in the YouTube response');
    }

    const { id } = video;
    const { title, thumbnails } = video.snippet;
    const { duration } = video.contentDetails || {};
    const durationMs: number = parseDurationToMs(duration)
    const thumbnailUrl = await getThumbnailUrl(thumbnails);
    const type:'short' | 'image' | 'video' | 'photo' = determineVideoType(durationMs) 

    return {
        type: type,
        platform: 'youtube',
        thumbnailUrl: thumbnailUrl,
        postUrl: `https://www.youtube.com/watch?v=${id}`,
        title: title,
        durationMs: durationMs!,
        postId: id
    }
};

export const extractYoutubeData = async (youtubeMetaData: any): Promise<YoutubeMedia> => {
    const { items } = youtubeMetaData;
    const video = items[0];

    if (!video || video.length === 0) {
        throw new Error('No video data found in the YouTube response');
    }

    const { description } = video.snippet;
    const { definition } = video.contentDetails || {};

    return {
        description: description,
        definition: definition,
    };
};

export async function getTranscript(videoId: string): Promise<TranscriptResponse[]> {
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

export function getEnglishTranscripts(transcriptItems: TranscriptResponse[]): CaptionItem[] {
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
        if (error instanceof Error) {
            console.error('Error fetching transcript:', error);
            throw new Error(`Failed to fetch transcript: ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('Failed to fetch transcript due to an unexpected error.');
        }
    }
}

const parseDurationToMs = (isoDuration: string): number => {
    if (!isoDuration) return 0;

    let hours = 0, minutes = 0, seconds = 0;

    const hourMatch = isoDuration.match(/(\d+)H/);
    const minuteMatch = isoDuration.match(/(\d+)M/);
    const secondMatch = isoDuration.match(/(\d+)S/);

    if (hourMatch) hours = parseInt(hourMatch[1]);
    if (minuteMatch) minutes = parseInt(minuteMatch[1]);
    if (secondMatch) seconds = parseInt(secondMatch[1]);

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

const determineVideoType = (durationMs:number): 'short' | 'image' | 'video' | 'photo' => {
    if (durationMs && durationMs < 60000) {
        return 'short';
    }

    return 'video';
};

export const getThumbnailUrl = async (thumbnails: any): Promise<string> => {
    const { maxres, standard, high, medium, default: defaultThumbnail } = thumbnails;

    if (maxres) {
        return maxres.url;
    } else if (standard) {
        return standard.url;
    } else if (high) {
        return high.url;
    } else if (medium) {
        return medium.url;
    } else if (defaultThumbnail) {
        return defaultThumbnail.url;
    }

    return '';
}

export const extractCaptions = (captions:CaptionItem[]) => {
    let captionsText =""
    captions.map(captObj => 
        captionsText = captionsText.concat(captObj.text)+" "
    )
    return captionsText
}

export const saveToDatabase = async (mediaData: Media, youtubeData: YoutubeMedia) => {
    // Inserting into youtubeMedia schema
    const { id:youtubeId } = await insertYoutubeMedia(youtubeData);
    mediaData.youtubeId = youtubeId;
    console.log(mediaData)

    // Inserting into media schema first
    const {id:mediaId } = await insertMedia(mediaData);
    return mediaId;
}

export const storeEmbeddings = async(mediaData:Media, youtubeData:YoutubeMedia):Promise<number> => {
    const vectorStore = new contentVectorStore();
    const embeddingGenerator = new EmbeddingGenerator();

    try{
        // initialize the category embeddings and store them in cache
        const categoryEmbeddings:Record<string, number[]> = await embeddingGenerator.initializeEmbeddings(Helper.categoryDefinitions)
        console.log("Categories available for classification:", Object.keys(categoryEmbeddings));
        
        const preprocessedContent: string = await embeddingGenerator.extractAndPreprocessData(mediaData, youtubeData);
        if (!preprocessedContent) throw new Error("Preprocessing failed: content is undefined or empty");

        const contentEmbeddings: number[] = await embeddingGenerator.generateEmbeddings(preprocessedContent);
        if (!Helper.categoryDefinitions || Object.keys(Helper.categoryDefinitions).length === 0) {
            throw new Error("Category definitions are empty");
        }
        console.log(`Found ${Object.keys(Helper.categoryDefinitions).length} category definitions`);
        const assignedCategory = vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);

        mediaData.category = assignedCategory;

        const embeddingIdInDatabase:number = await vectorStore.storeContent(preprocessedContent, contentEmbeddings, assignedCategory)
        return embeddingIdInDatabase;
    } catch (error) {
        console.error("Error in storeEmbeddings:", error);
        throw error;
    }
}
    

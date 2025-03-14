import { HelperFunctions } from "../../src/app/_lib/helper_funcs";
import { CaptionItem, Media, YoutubeMedia } from "../../types";
import { NextResponse } from "next/server";
import { insertMedia, insertYoutubeMedia } from "../server/functions/media";
import { YoutubeTranscript } from 'youtube-transcript';

export const fetchVideoFromYoutubeURL = async (link: string) => {
    try {
        const videoId = HelperFunctions.parseYoutubeEmbeddedLink(link);
        if (!videoId) {
            return NextResponse.json({ message: 'Unable to fetch videoId' }, { status: 500 });
        }

        if (!process.env.YOUTUBE_API_KEY) {
            return NextResponse.json({ message: 'Unable to fetch environment keys' }, { status: 400 });
        }

        const youtubeKey = process.env.YOUTUBE_API_KEY;

        const fetchedVideo = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeKey}&part=snippet,contentDetails,statistics,status`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        if (!fetchedVideo.ok) {
            return NextResponse.json({ message: 'Unable to fetch video metadata' }, { status: 400 });
        }

        const fetchedYoutubeMetaData = await fetchedVideo.json();

        const mediaData = await extractMediaData(fetchedYoutubeMetaData);

        const youtubeData = await extractYoutubeData(fetchedYoutubeMetaData); 

        youtubeData.englishCaptions = await getTranscript(videoId);

        const savedData = await saveToDatabase(mediaData,youtubeData);

        if (!savedData) {
            return NextResponse.json({ message: 'Error saving to the database' }, { status: 500 });
        }
        return savedData
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
    
    const thumbnailUrl = await getThumbnailUrl(thumbnails);
    
    const durationMs = duration ? parseDurationToMs(duration) : undefined;
    
    return {
        type: determineVideoType(video),
        platform: 'youtube',
        thumbnailUrl: thumbnailUrl,
        postUrl: `https://www.youtube.com/watch?v=${id}`,
        title: title,
        durationMs: durationMs,
        postId: id
    };
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

export async function getTranscript(videoId: string):Promise<CaptionItem[]> {
    try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

        const enTranscripts:CaptionItem[] = transcriptItems.filter((item: any): item is CaptionItem => 
            item.lang !== undefined && item.lang === 'en');


        if (enTranscripts.length === 0) {
            console.log('No English transcripts found, returning empty result');
            return [];
        }

        const formattedTranscripts:CaptionItem[] = enTranscripts.map((item) => ({
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

const determineVideoType = (video: any): 'short' | 'image' | 'video' | 'photo' => {
    const duration = video.contentDetails?.duration;
    const durationMs = parseDurationToMs(duration);

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

export const saveToDatabase = async (mediaData:Media, youtubeData:YoutubeMedia):Promise<{ id: number }> => {
    // Inserting into media schema first
    const returnedMedia = await insertMedia(mediaData);
    const mediaId:number = returnedMedia[0].id;  
    youtubeData.mediaId = mediaId

    // Inserting into youtubeMedia schema
    const returnedId = await insertYoutubeMedia(youtubeData);
    return returnedId[0];
}
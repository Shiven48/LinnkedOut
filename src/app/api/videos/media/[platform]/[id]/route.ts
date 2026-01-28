import {
  getMediaFromRedditById,
  getMediaFromYoutubeById,
  getFromMediaById,
} from "@/server/functions/media";
import { NextResponse } from "next/server";
import { RedditMedia, YoutubeMedia } from "@/services/common/types";
import { auth } from "@clerk/nextjs/server";

// Union type for either media type
type YoutubeOrReddit = YoutubeMedia | RedditMedia;

function isYoutubeMedia(media: YoutubeOrReddit): media is YoutubeMedia {
  return (media as YoutubeMedia).id !== undefined;
}

function isRedditMedia(media: YoutubeOrReddit): media is RedditMedia {
  return (media as RedditMedia).id !== undefined;
}

export async function GET(
  request: Request,
  context: {
    params: {
      platform?: string;
      id?: string;
    };
  }
) {
  const params = await context.params;

  if (!params) {
    return NextResponse.json(
      { message: "Error fetching videos", error: "No parameters provided" },
      { status: 400 }
    );
  }

  const { platform, id } = params;

  if (!platform || !id) {
    return NextResponse.json(
      {
        message: "Error fetching videos",
        error: "Missing platform or id parameters",
      },
      { status: 400 }
    );
  }

  const mediaId = Number(parseInt(id));

  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { message: "Error fetching videos", error: "unauthorised" },
        { status: 401 }
      );

    const generalMedia = await getFromMediaById(mediaId, userId);
    if (!generalMedia)
      return NextResponse.json(
        { message: "Error fetching videos", error: "unauthorised" },
        { status: 401 }
      );

    const trimmedPlatform = platform.toLowerCase().trim();
    let fetchedVideo: YoutubeOrReddit | null = null;

    if (trimmedPlatform === "youtube" && generalMedia.youtubeId) {
      fetchedVideo = await getMediaFromYoutubeById(generalMedia.youtubeId);
      if (fetchedVideo && isYoutubeMedia(fetchedVideo)) {
        console.log(`Successfully retrieved YouTube video: ${fetchedVideo.id}`);
        return NextResponse.json({ body: fetchedVideo }, { status: 200 });
      }
    } else if (trimmedPlatform === "reddit" && generalMedia.redditId) {
      fetchedVideo = await getMediaFromRedditById(generalMedia.redditId);
      if (fetchedVideo && isRedditMedia(fetchedVideo)) {
        console.log(`Successfully retrieved Reddit video: ${fetchedVideo.id}`);
        return NextResponse.json({ body: fetchedVideo }, { status: 200 });
      }
    }

    if (!fetchedVideo) {
      return NextResponse.json(
        {
          message: `Cannot get video from ${trimmedPlatform} with ID ${mediaId}!`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Video does not belong to youtube nor reddit!" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Error fetching videos", error: errorMessage },
      { status: 500 }
    );
  }
}

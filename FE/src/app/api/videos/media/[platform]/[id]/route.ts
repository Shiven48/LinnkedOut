import {
  getMediaFromRedditById,
  getMediaFromYoutubeById,
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
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const params = await context.params;

  if (!params) {
    return NextResponse.json(
      { message: "Error fetching videos", error: "No parameters provided" },
      { status: 400 }
    );
  }

  const { platform, id } = params;
  console.log(`Platform: ${platform}`);
  console.log(`Id: ${id}`);

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
  console.log(`Processing request for platform: ${platform}, id: ${mediaId}`);
  const trimmedPlatform = platform.toLowerCase().trim();

  try {
    let fetchedVideo: YoutubeOrReddit | null = null;

    if (trimmedPlatform === "youtube") {
      fetchedVideo = await getMediaFromYoutubeById(mediaId, userId);
      if (fetchedVideo && isYoutubeMedia(fetchedVideo)) {
        console.log(`Successfully retrieved YouTube video: ${fetchedVideo.id}`);
        return NextResponse.json({ body: fetchedVideo }, { status: 200 });
      }
    } else if (trimmedPlatform === "reddit") {
      console.log("You are here hitting shitting on mediaId");
      fetchedVideo = await getMediaFromRedditById(mediaId, userId);
      console.log(JSON.stringify(fetchedVideo, null, 2));
      if (fetchedVideo && isRedditMedia(fetchedVideo)) {
        console.log(`Successfully retrieved Reddit video: ${fetchedVideo.id}`);
        return NextResponse.json({ body: fetchedVideo }, { status: 200 });
      }
    }

    if (!fetchedVideo) {
      throw new Error(
        `Cannot get video from ${trimmedPlatform} with ID ${mediaId}!`
      );
    }
    throw new Error(`Video doesnt belong to youtube nor reddit!`);
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

"use client";
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/shared/SideVideo";
import { CaptionItem, Media, YoutubeMedia } from "@/services/common/types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/shared/Loading";
import Image from "next/image";
import { YoutubeMetadataDisplay } from "@/app/_components/shared/YoutubeMetadataDisplay";

declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export const Page = ({
  params,
}: {
  params: Promise<{
    platformId: number;
    videoId: number;
  }>;
}) => {
  // Here i am getting mediaId!!
  const mediaId = use(params).videoId;

  // Here i am getting youtubeId!!
  const youtubeId = use(params).platformId;

  console.log(`PARAMS: ${use(params).platformId}`);

  const [video, setVideo] = useState<Media | null>(null);
  const [youtubeVideo, setYoutubeVideo] = useState<YoutubeMedia>();
  const isOpen = useSidebarState((state) => state.isOpen);
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
  const playerRef = useRef<any>(null);
  const [isHidden, setIsHidden] = useState<boolean>(true);

  // This is for the media
  useEffect(() => {
    const fetchDataById = async (mediaId: number) => {
      try {
        if (isOpen) {
          useSidebarState.getState().setIsOpen(false);
        }
        const res = await fetch(`/api/videos/${mediaId}`);

        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Video API response:", data);

        if (data && data.body) {
          setVideo(data.body);
        } else {
          throw new Error("No video data found");
        }
      } catch (error: any) {
        console.error("Error fetching video:", error);
      }
    };

    if (mediaId) {
      fetchDataById(mediaId);
    }
  }, [mediaId]);

  useEffect(() => {
    const fetchYoutubeData = async (id: number) => {
      try {
        const res = await fetch(`/api/videos/media/youtube/${id}`);

        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }

        const data = await res.json();
        if (data && data.body) {
          setYoutubeVideo(data.body);
          console.log(`youtubeVideo: ${JSON.stringify(youtubeVideo)}`);
        }
      } catch (error: any) {
        console.error("Error fetching YouTube data:", error);
      }
    };

    if (mediaId) {
      fetchYoutubeData(mediaId);
      console.log(`YT (mediaId): ${mediaId}`); // youtube
    }
  }, [mediaId]);

  // This is for creating iframe for youtube
  useEffect(() => {
    if (!video?.postId) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: video.postId,
        events: {
          onStateChange: onPlayerStateChange,
          onReady: onPlayerReady,
          onError: onPlayerError,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [video?.postId]);

  const onPlayerReady = () => {
    console.log("Player ready");
  };

  const onPlayerError = (event: any) => {
    console.error("Player error:", event);
  };

  const onPlayerStateChange = (event: { data: number }) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (
      event.data === window.YT.PlayerState.PAUSED ||
      event.data === window.YT.PlayerState.ENDED
    ) {
      setIsPlaying(false);
    }
  };

  const handleHidden = () => {
    setIsHidden((prev) => !prev);
  };

  return (
    <div
      className={`overflow-y-auto pb-10 bg-transparent flex flex-row smallScreenPlatform w-screen h-screen
    ${
      isPlaying
        ? "bg-black/60 transition-all duration-500"
        : "transition-all duration-500"
    }
  `}
    >
      {/* The First half of the section */}
      <div
        className="ml-10 smallFirstHalfComponents w-full lg:w-[70%] h-[calc(100vh-48px)] overflow-y-auto scrollbar-hide"
        id="For left Handed Components"
      >
        {/* Youtube Player */}
        <div
          className={`mt-5 smallYoutubeVideoContainer rounded-xl w-full lg:w-[95%] transition-all duration-500`}
        >
          <div className="relative w-full pb-[56.25%]">
            {video?.postId ? (
              <div
                id="youtube-player"
                className="absolute top-0 left-0 w-full h-full"
              />
            ) : (
              <Loading />
            )}
          </div>
        </div>

        {/* Metadata*/}
        <div className="sm:w-[60%] lg:w-[95%] block">
          <YoutubeMetadataDisplay video={video} />

          {youtubeVideo?.description && (
            <div className="mt-8 w-full block">
              <div
                className="flex items-center gap-3 cursor-pointer group w-fit px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={handleHidden}
              >
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors tracking-wide">
                  {isHidden ? "View Description" : "Hide Description"}
                </span>
                <div className="bg-white/10 p-1.5 rounded-full group-hover:bg-golden/30 transition-colors">
                  <Image
                    src={isHidden ? "/right.svg" : "/down.svg"}
                    alt="Toggle Description"
                    width={10}
                    height={10}
                    className="opacity-90"
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-700 ease-in-out overflow-hidden ${
                  isHidden ? "max-h-0 opacity-0 mt-0" : "max-h-[3000px] opacity-100 mt-5"
                }`}
              >
                <div className="relative p-6 md:p-8 rounded-3xl bg-[#111113]/90 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden group/desc">
                  {/* Subtle background glow effect */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-golden/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity duration-700 opacity-50 group-hover/desc:opacity-100"></div>
                  
                  {/* Decorative accent line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-gradient-to-b from-transparent via-golden/50 to-transparent opacity-50 rounded-r-full"></div>
                  
                  <p className="text-[14px] md:text-[15px] text-gray-300/85 leading-[1.8] whitespace-pre-wrap font-light relative z-10 selection:bg-golden/30 selection:text-white">
                    {youtubeVideo.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* second half of the screen*/}
      <div
        className="w-[40%] smallSecondHalfComponents scrollbar-hide overflow-y-auto"
        id="For right Handed Components"
      >
        {/* <SideChat /> */}
        <SideVideo />
      </div>
    </div>
  );
};

export default Page;

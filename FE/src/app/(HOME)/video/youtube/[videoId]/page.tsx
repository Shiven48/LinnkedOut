'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { Media, YoutubeMedia } from "../../../../../../types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/Loading";
import Link from "next/link";
import Image from "next/image";

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

export const Page = (
  { params }: {
    params: Promise<{
      videoId: number;
    }>
  }
) => {
  const id = use(params).videoId;
  const [video, setVideo] = useState<Media | null>(null);
  const [youtubeVideo, setYoutubeVideo] = useState<YoutubeMedia | null>(null);
  const isOpen = useSidebarState((state) => state.isOpen);
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
  const playerRef = useRef<any>(null);
  const [isHidden,setIsHidden] = useState<boolean>(false) 

  // This is for the media
  useEffect(() => {
    const fetchDataById = async (id: number) => {
      try {
        if (isOpen) {
          useSidebarState.getState().setIsOpen(false);
        }
        const res = await fetch(`/api/videos/${id}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data = await res.json();
        setVideo(data.body);
      } catch (error: unknown) {
        console.error('Error fetching media:', error);
      }
    }
    fetchDataById(id);
  }, [id, isOpen]);

  // This is for the youtube media
  useEffect(() => {
    const fetchDataById = async (id: number) => {
      try {
        const res = await fetch(`/api/videos/media/youtube/${id}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data = await res.json();
        setYoutubeVideo(data.body);
      } catch (error: unknown) {
        console.error('Error fetching media:', error);
      }
    }
    fetchDataById(id);
  }, [id]);

  console.log("YouTube Video data:", youtubeVideo);

  // This is for creating iframe for youtube
  useEffect(() => {
    if (!video?.postId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: video.postId,
        events: {
          'onStateChange': onPlayerStateChange,
          'onReady': onPlayerReady,
          'onError': onPlayerError
        }
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
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };

  const handleHidden = () => {
    setIsHidden((prev) => !prev)
  }

  console.log(isHidden)

  return (
    <div className={`overflow-y-auto flex flex-row h-screen w-full bg-[#181818] relative
      ${isPlaying ? 'bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
    `}>
      <div className={`mt-20 ml-20 border-4 rounded-xl z-40 w-full sm:w-[70%] lg:w-[60%] h-[60%] overflow-hidden relative transition-all duration-500
          ${isPlaying ? 'border-dark-golden shadow-xl' : 'border-golden'}
      `}>
        {video?.postId ? (
          <div id="youtube-player" className="w-full h-full" />
        ) : (
          <Loading />
        )}
      </div>
      <div className="ml-20 mt-16 absolute top-[65%] sm:w-[70%] lg:w-[60%] h-[10%]">
        <div className="flex justify-between">
          <p className="text-white mb-2 text-2xl">{video?.title}</p>
          <div className="text-white mb-2">
            {video?.postUrl && (
              <Link href={video.postUrl}>
                <div className={`w-32 h-8 flex bg-dark-golden border border-white rounded-xl
                    hover-thread
                  `}>
                  <p className={`text-black flex items-center font-serif ml-9`}>YouTube</p>
                </div>
              </Link>
            )}
          </div>
        </div>
        <div className="flex">
          <span className="text-gray-400 text-xl">{video?.type || "Unknown type"}</span>
        </div>
        {youtubeVideo?.description && (
          <div className={`mt-4 text-white max-h-40`}>
            <div className="flex relative gap-4 h-8">
              <h3 className="text-xl mb-2 text-gray-400">Description</h3>
              <Image
                src={`${isHidden ? '/right.svg' : '/down.svg' }`}
                alt=""
                width={5}
                height={5}
                className={`bg-white rounded-full h-5 w-5 cursor-pointer mt-1`} 
                onClick={handleHidden}
              />
            </div>
            <p className={`text-gray-300"
              ${isHidden ? 'hidden' : 'whitespace-pre-line'} `}
            >{youtubeVideo.description}</p>
          </div>
        )}
      </div>
      <SideVideo />
    </div>
  );
}

export default Page;
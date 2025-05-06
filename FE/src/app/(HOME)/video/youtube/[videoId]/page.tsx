'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { Media, YoutubeMedia } from "../../../../../../types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/shared/Loading";
import Link from "next/link";
import Image from "next/image";
import SmallLoading from "@/app/_components/shared/SmallLoading";

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
  const [youtubeVideo, setYoutubeVideo] = useState<YoutubeMedia>();
  const isOpen = useSidebarState((state) => state.isOpen);
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
  const playerRef = useRef<any>(null);
  const [isHidden,setIsHidden] = useState<boolean>(false) 
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false)
  const [summary, setSummary] = useState<string>('')

  // This is for the media
  useEffect(() => {
    const fetchDataById = async (videoId: number) => {
      try {
        if (isOpen) {
          useSidebarState.getState().setIsOpen(false);
        }
        const res = await fetch(`/api/videos/${videoId}`);
        
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Video API response:", data);
        
        if (data && data.body) {
          setVideo(data.body);
        } else {
          throw new Error('No video data found');
        }
      } catch (error: any) {
        console.error('Error fetching video:', error);
      } 
    };
    
    if (id) {
      fetchDataById(id);
    }
  }, [id, isOpen]);

  useEffect(() => {
    const fetchYoutubeData = async (youtubeId: number) => {
      try {
        const res = await fetch(`/api/videos/media/youtube/${youtubeId}`);
        
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        
        const data = await res.json();        
        if (data && data.body) {
          setYoutubeVideo(data.body);
          console.log(`youtubeVideo: ${JSON.stringify(youtubeVideo)}`)
        }
      } catch (error: any) {
        console.error('Error fetching YouTube data:', error);
      }
    };
    
    if (video && video.youtubeId && !isNaN(Number(video.youtubeId)) && Number(video.youtubeId) > 0) {
      fetchYoutubeData(Number(video.youtubeId));
    }
  }, [video]);

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

  const handleSummarizeClick = async() => {
    try{  
      setIsSummarizing(true)
      const captions = youtubeVideo?.englishCaptions;
      if(!captions || captions === undefined || captions === null || typeof captions !== 'string'){
        setSummary('captions are not present')
        return;
      }
      const CaptionsData = {
        caption: captions
      }
      const response = await fetch(`/api/summarize`,{
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(CaptionsData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const Summary = await response.json();
    console.log('Summary received:', Summary.body);

    setSummary(Summary.body)
    } catch(error){
      console.error(`Error Summarizing video`)
    } finally{
      setIsSummarizing(false)
    }
  }

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
                <div className={`w-32 h-8 flex bg-dark-golden border border-white rounded-xl hover:bg-golden
                    hover-thread
                  `}>
                  <p className={`text-black flex items-center font-serif ml-9`}>YouTube</p>
                </div>
              </Link>
            )}
          </div>
        </div>
        <div className="flex">
          <span className="text-gray-400 text-xl">{video?.type}</span>
        </div>
        {youtubeVideo?.description && (
          <div className="flex justify-between">
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
            <p className={`text-gray-300 mt-4 "
              ${isHidden ? 'hidden' : 'whitespace-pre-line'} `}
            >{youtubeVideo.description}</p>
            </div>
            <div className="text-white mb-2">
              {video?.postUrl && (
                <button onClick={handleSummarizeClick}>
                  <div className={`w-32 h-8 flex items-center justify-center bg-dark-golden border border-white rounded-xl hover:bg-golden
                      hover-thread
                    `}>
                    <span className={`text-black font-serif`}>{isSummarizing ? <SmallLoading /> : `Summarize`}</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <SideVideo />
    </div>
  );
}

export default Page;
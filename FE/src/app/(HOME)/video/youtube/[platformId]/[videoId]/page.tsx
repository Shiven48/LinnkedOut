'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { CaptionItem, Media, YoutubeMedia } from '@/services/common/types';
import { usePlayingState } from "../../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/shared/Loading";
import Link from "next/link";
import Image from "next/image";
import { SideChat } from "@/app/_components/shared/SideChat";
import { useParams } from "next/navigation";
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

export const Page = (
  { params }: {
    params: Promise<{
      platformId: number;
      videoId: number;
    }>
  }
) => {

  // Here i am getting mediaId!!
  const mediaId = use(params).videoId;

  // Here i am getting youtubeId!!
  const youtubeId = use(params).platformId;

  console.log(`PARAMS: ${use(params).platformId}`)

  const [video, setVideo] = useState<Media | null>(null);
  const [youtubeVideo, setYoutubeVideo] = useState<YoutubeMedia>();
  const isOpen = useSidebarState((state) => state.isOpen);
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
  const playerRef = useRef<any>(null);
  const [isHidden, setIsHidden] = useState<boolean>(true)
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false)
  const [summary, setSummary] = useState<string>('')
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState<string>('')

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
          throw new Error('No video data found');
        }
      } catch (error: any) {
        console.error('Error fetching video:', error);
      }
    };

    if (mediaId) {
      fetchDataById(mediaId);
    }
  }, [mediaId]);

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

    fetchYoutubeData(youtubeId);
    console.log(`YT: ${youtubeId}`) // youtube
  }, [youtubeId])

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

  const extractCaptions = (captions: CaptionItem[]): string => {
    return captions.map(captObj => captObj.text).join(' ');
  };

  const handleSummarizeClick = async () => {
    try {
      setIsSummarizing(true)
      setSummary('');

      const captions: CaptionItem[] | undefined = youtubeVideo?.englishCaptions;
      if (!captions || captions === undefined || captions === null || captions.length <= 0) {
        setSummary('captions are not present')
        return;
      }

      const captionsbody: string = extractCaptions(captions);
      const CaptionsData = {
        captionbody: captionsbody
      }

      // Making request to the summarize endpoint
      const response = await fetch(`/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(CaptionsData),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accSummary = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true })
        accSummary += chunk;
        setSummary(accSummary);
      }
    } catch (error) {
      console.error(`Error Summarizing video`, error);
      setSummary('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  }

  const handleuserInputQuery = async () => {
  }

  const closeSummary = () => {
    setIsSummaryOpen(false);
  };

 return (
  <div className={`overflow-y-auto pb-10 bg-dark flex flex-row smallScreenPlatform w-screen h-screen
    ${isPlaying ? 'bg-darker transition-all duration-500' : 'transition-all duration-500'}
  `}>
    {/* The First half of the section */}
    <div className="ml-10 smallFirstHalfComponents w-full lg:w-[70%] h-[calc(100vh-48px)] overflow-y-auto scrollbar-hide bg-dark" id="For left Handed Components">
      
      {/* Youtube Player */}
      <div className={`mt-5 smallYoutubeVideoContainer rounded-xl w-full lg:w-[95%] transition-all duration-500`}>
        <div className="relative w-full pb-[56.25%]">
          {video?.postId ? (
            <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"/>
          ) : (
            <Loading />
          )}
        </div>
      </div>
      
      {/* Metadata*/}
      <div className="sm:w-[60%] lg:w-[95%] block">
        <YoutubeMetadataDisplay video={video} />
        
        {youtubeVideo?.description && (
          <div className="flex justify-between smallDescription">
            <div className={`mt-4 text-white max-h-40 w-full`}>
              <div className="flex gap-4 h-8">
                <h3 className="text-xl text-gray-400">Description</h3>
                <Image
                  src={`${isHidden ? '/right.svg' : '/down.svg'}`}
                  alt=""
                  width={5}
                  height={5}
                  className={`bg-white rounded-full h-5 w-5 cursor-pointer mt-1`}
                  onClick={handleHidden}
                />
              </div>
              <p className={`text-gray-300 mt-2 bg-dark p-2 rounded-xl border-l-2 border-l-golden shadow-golden shadow-xl
                        ${isHidden ? 'hidden' : 'whitespace-pre-wrap'} `}
              >{youtubeVideo.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
        
    {/* second half of the screen*/}
    <div className="w-[40%] smallSecondHalfComponents scrollbar-hide overflow-y-auto" id="For right Handed Components">
        {/* <SideChat /> */}
        <SideVideo />
      </div>
  </div>
)
}

export default Page;
'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { YoutubeMedia } from "../../../../../../types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/Loading";

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
    const id = use(params).videoId
    const [video, setVideo] = useState<YoutubeMedia | null>(null)
    const isOpen = useSidebarState((state) => state.isOpen)
    const isPlaying = usePlayingState((state) => state.isPlaying)
    const setIsPlaying = usePlayingState((state) => state.setIsPlaying)
    const playerRef = useRef<any>(null)
    
    useEffect(() => {
        const fetchDataById = async (id: number) => {
            try {
                if (isOpen) {
                    useSidebarState.getState().setIsOpen(false);
                }
                const res = await fetch(`/api/videos/media/youtube/${id}`);
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                const data = await res.json();
                setVideo(data.body);
            } catch (error: unknown) {
                console.error('Error fetching media:', error);
            }
        }
        fetchDataById(id)
    }, [id])
    
    useEffect(() => {
        if (!video?.videoId) return;
        
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
        
        const onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player', {
                videoId: video.videoId,
                events: {
                    'onStateChange': onPlayerStateChange
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
    }, [video?.videoId]);
    
    const onPlayerStateChange = (event: { data: number }) => {
        setIsPlaying(event.data === 1);
    };
    
    return (
        <div className={`flex h-screen w-full bg-dark p-4 relative`}>
          <div className={`absolute inset-0 z-0
                ${isPlaying ? 'bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
            `}>
          <div className={`flex-1 w-full transition-all duration-500 absolute inset-0 h-[calc(100vh-48px)] top-5 overflow-y-auto flex`}>
            <div
              className={`border-4 rounded-xl m-5 z-40 w-full sm:w-[70%] lg:w-[80%] h-[70%] overflow-hidden relative transition-all duration-500
                ${isPlaying ? 'border-dark-golden shadow-xl' : 'border-golden'}`}
            >
              {video?.videoId ? (
                <div id="youtube-player" className="w-full h-full" />
              ) : (
                <Loading />
              )}
            </div>
            <SideVideo />
          </div>
        </div>
        </div>
      );
      
}

export default Page
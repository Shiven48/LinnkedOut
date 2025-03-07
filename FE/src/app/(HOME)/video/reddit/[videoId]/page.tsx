'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { RedditMedia } from "../../../../../../types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";

export const Page = (
  { params }: {
    params: Promise<{
      videoId: number;
    }>
  }
) => {

  const id = use(params).videoId;
  const [video, setVideo] = useState<RedditMedia | null>(null);
  const isOpen = useSidebarState((state) => state.isOpen);
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchDataById = async (id: number) => {
      try {
        if (isOpen) {
          useSidebarState.getState().setIsOpen(false);
        }
        const res = await fetch(`/api/videos/media/reddit/${id}`);
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

  const handleVideoEnded = () => {
    setIsPlaying(false);
  }

  const handleVideoStateChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoRef.current?.paused) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }

  return (
    <div className="flex flex-row h-screen w-full bg-[#181818]">
      <div className="card-green-glass rounded-xl m-10 w-[70%] h-[70%] border-golden flex items-center justify-center overflow-hidden
      ">
        {video?.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-full object-contain"
            controls
            onPause={handleVideoStateChange}
            onEnded={handleVideoEnded}
            onClick={handleVideoStateChange}
          />
        ) : (
          <div className="text-white">No video available</div>
        )}
      </div>
      <SideVideo />
    </div>
  );
}

export default Page;
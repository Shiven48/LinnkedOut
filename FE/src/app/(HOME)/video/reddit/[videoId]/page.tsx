'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { RedditMedia } from "../../../../../../types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/Loading";

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
      setIsPlaying(!isPlaying)
    }
  }

  console.log(`The video Url : ${video}`)

  return (
    <div className={`flex flex-row h-screen w-full bg-[#181818] relative
      ${isPlaying ? 'bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
    `}>
      <div className={`border-4 rounded-xl m-5 z-40 w-full sm:w-[70%] lg:w-[80%] h-[70%] overflow-hidden relative transition-all duration-500
          ${isPlaying ? 'border-dark-golden shadow-xl' : 'border-golden'}
      `}>
        {video?.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className={`w-full h-full object-contain`}
            controls
            onPause={handleVideoStateChange}
            onEnded={handleVideoEnded}
            onClick={handleVideoStateChange}
          />
        ) : (
          <Loading />
        )}
      </div>
      <SideVideo />
    </div>
  );
}

export default Page;
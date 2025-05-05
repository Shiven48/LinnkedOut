'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { CommentData, Media, RedditMedia } from "../../../../../../types";
import { usePlayingState } from "../../../../../../hooks/useIsPlaying";
import Loading from "@/app/_components/shared/Loading";
import CommentsDisplay from "@/app/_components/comments/CommentsDisplay";
import Link from "next/link";

export const Page = (
  { params }: {
    params: Promise<{
      videoId: number;
    }>
  }
) => {

  const id = use(params).videoId;
  const [video, setVideo] = useState<Media | null>(null);
  const [redditVideo, setRedditVideo] = useState<RedditMedia | null>(null);
  const isOpen = useSidebarState((state) => state.isOpen);
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // This is for the reddit media
  useEffect(() => {
    const fetchDataById = async (id: number) => {
      try {
        const res = await fetch(`/api/videos/media/reddit/${id}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data = await res.json();
        setRedditVideo(data.body);
      } catch (error: unknown) {
        console.error('Error fetching media:', error);
      }
    }
    fetchDataById(id); 
  },[id])

console.log(redditVideo?.comments)

  const handleVideoEnded = () => {
    setIsPlaying(false);
  }

  const handleVideoStateChange = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  console.log(`The redditVideo : ${redditVideo}`)

  return (
    <div className={`overflow-y-auto flex flex-row h-screen w-full bg-[#181818] relative
      ${isPlaying ? 'bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
    `}>
      <div className={`mt-20 ml-20 border-4 rounded-xl z-40 w-full sm:w-[70%] lg:w-[60%] h-[60%] overflow-hidden relative transition-all duration-500
          ${isPlaying ? 'border-dark-golden shadow-xl' : 'border-golden'}
      `}>
          {video?.postUrl ? (
            <video
              ref={videoRef}
              src={video.postUrl}
              className={`w-full h-full object-contain`}
              controls
              onPlay={handleVideoStateChange}
              onPause={handleVideoStateChange}
              onEnded={handleVideoEnded}
              onClick={handleVideoClick}
            />
          ) : (
            <Loading />
          )}
      </div>
      <div className="ml-20 mt-16 absolute top-[65%] sm:w-[70%] lg:w-[60%] h-[10%]">
        <div className="flex justify-between">
          <p className="text-white mb-2 text-2xl">{video?.title}</p>
          <div className="text-white mb-2 ">
            <Link
              href={redditVideo?.postLink || ''}
            >
              <div className={`w-32 h-8 flex bg-dark-golden border border-white rounded-xl
                  hover-thread
                `}>
                <p 
                  className={`text-black flex items-center font-serif ml-9 
                  `}
                >Thread</p>
              </div>
            </Link>
            </div>
        </div>
        <div className="flex">
        <span className="text-gray-400 text-xl">{redditVideo?.subreddit} | {redditVideo?.author}</span>
        </div>
        <CommentsDisplay comments={redditVideo?.comments as CommentData[] ?? []} />
      </div>
      <SideVideo />
    </div>
  );
}

export default Page;
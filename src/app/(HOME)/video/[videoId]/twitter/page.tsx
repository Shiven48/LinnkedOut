'use client'
import { use, useEffect, useState, useRef } from "react";
import { useSidebarState } from "../../../../../../hooks/useSideBarState";
import SideVideo from "@/app/_components/SideVideo";
import { TwitterMedia, YoutubeMedia } from "../../../../../../types";

export const Page = (
    { params }: {
        params: Promise<{
            videoId: number;
        }>
    }
) => {
    const id = use(params).videoId
    const [video, setVideo] = useState<TwitterMedia | null>(null)
    const isOpen = useSidebarState((state) => state.isOpen)
    const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const fetchDataById = async (id: number) => {
            try {
                if (isOpen) {
                    useSidebarState.getState().setIsOpen(false);
                }
                const res = await fetch(`/api/videos/media/${id}/twitter`);
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                const data = await res.json();
                setVideo(data);
            } catch (error: unknown) {
                console.error('Error fetching media:', error);
            }
        }
        fetchDataById(id)
    }, [id])

    const handleVideoPlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(prev => !prev)
        }
    }

    const handleVideoEnded = () => {
        setIsPlaying(false);
    }

    return (
        <div className="flex flex-row h-screen w-full bg-[#181818]">
            <div className="card-green-glass rounded-xl m-10 w-[70%] h-[70%] border-golden flex items-center justify-center">
                {video?.videoUrl ? (
                    <video
                        ref={videoRef}
                        src={video.videoUrl}
                        className="max-w-full max-h-full"
                        controls
                        onClick={handleVideoPlay}
                        onEnded={handleVideoEnded}
                    />
                ) : (
                    <div className="text-white">No video available</div>
                )}
            </div>
            <SideVideo />
        </div>
    )
}

export default Page
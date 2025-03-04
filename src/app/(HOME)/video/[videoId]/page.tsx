'use client'
import { use, useEffect, useState } from "react";
import { useSidebarState } from "../../../../../hooks/useSideBarState";
import { Media } from "../../../../../types";

export const Page = (
    { params }: {
        params: Promise<{
            videoId: number;
        }>
    }
) => {
    const id = use(params).videoId
    const[video, setVideo] = useState<Media | null>(null)
    const isOpen = useSidebarState((state) => state.isOpen)

    // closing the sidebar to get more space to show the video
    useEffect(() => {
        const fetchDataById = async (id:number) => {
            try {
                if(isOpen) {
                    useSidebarState.getState().setIsOpen(false);
                }
                const res = await fetch(`/api/videos/media/${id}`);
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
    },[id])

    console.log(video)
    const thumbnailUrl = video?.thumbnailUrl

    return (
        <div className="h-screen w-full bg-[#181818]">
            <div className="bg-stone-700 rounded-xl m-10 w-[70%] h-[70%]">
                <iframe  
                    src={`${thumbnailUrl}`}
                />
            </div>
        </div>
    )
} 

export default Page
'use client'
import { useEffect, useState } from "react";
import { useSidebarState } from "../../../hooks/useSideBarState";
import Trial from "../_components/Trial";
import { Media } from "../../../types";
import Image from "next/image";
import Card from "../_components/Card";

export default function Home() {
    // const isOpen = useSidebarState(state => state.isOpen) 
    const [media,setMedia] = useState<Media[]>([])
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const fetchedMedia = async () => {
            try {
                const res = await fetch('/api/videos');
                if (!res.ok) {  
                    throw new Error(`Error: ${res.statusText}`);
                }
                const data = await res.json();
                setMedia(data.body);
            } catch(error: unknown) {
                console.error('Error fetching media:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            }
        }   
        fetchedMedia();
    }, []);

    console.log(media);

    return (
        <div className="h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark">
            <div className="flex justify-evenly mt-10 flex-wrap cursor-pointer">
                {media.length > 0 ? (
                    media.map((video: Media) => (
                        <div 
                            key={video.id}
                            className="relative bg-golden w-[30%] h-72 p-4 rounded-xl shadow-sm shadow-white border border-black m-4 
                            transition 1s ease-out flex flex-col items-center hover-page-card"
                        >
                            <Card media={video}/>
                        </div>
                    ))
                ) : (
                    <div>No videos available</div>  // Display fallback message if no media is available
                )}
            </div>
        </div>
    );
}
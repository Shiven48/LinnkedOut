'use client'
import { useEffect, useState } from "react";
import { useSidebarState } from "../../../hooks/useSideBarState";
import { Media } from "../../../types";
import Image from "next/image";
import Card from "../_components/Card";

export default function Home() {
    // const isOpen = useSidebarState(state => state.isOpen) 
    const [media, setMedia] = useState<Media[]>([])
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
            } catch (error: unknown) {
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
                            className="card-green-glass w-[30%] h-64 p-4 m-4"
                        >
                            <Card media={video} />
                            {/* Solve this issue of width*/}
                            <div className='flex absolute bottom-4 w-full justify-center card-green-glass h-20 w-20'>
                                <span className="span-prop mr-80">{video.platform}</span>
                                <span className="span-prop mr-20"> {video.type}</span>
                                <span className="span-prop ml-60"> {new Date(video.createdAt).toDateString()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No videos available</div>  // Display fallback message if no media is available
                )}
            </div>
        </div>
    );
}
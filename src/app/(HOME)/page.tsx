'use client'
import { useEffect, useState } from "react";
import { Media } from "../../../types";
import Card from "../_components/Card";
import Link from "next/link";

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
            <div className="flex justify-evenly mt-6 flex-wrap cursor-pointer">
                {media.length > 0 ? (
                    media.map((video: Media) => (
                        <div
                            key={video.id}
                            className="card-green-glass w-[30%] h-53 my-8"
                        >
                            <Card media={video} />
                            <div className='flex justify-evenly'>
                                <div className="gap-5 rounded-2xl w-full h-full py-1 flex justify-evenly relative top-54">
                                    <Link 
                                        className="span-prop basic-text button-hover"
                                        href='#'
                                        > 
                                        {video.type}
                                    </Link>
                                    <Link
                                        className="span-prop basic-text button-hover"
                                        href="#"
                                        >
                                        {video.platform}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No videos available</div>
                )}
            </div>
        </div>
    );
}
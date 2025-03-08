'use client'
import { useEffect, useState } from "react";
import { Media } from "../../../types";
import Card from "../_components/ThumbnailCard";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Loading from "../_components/Loading";
import NoContent from "../_components/NoContent";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true)
    const [media, setMedia] = useState<Media[]>([])
    const [error, setError] = useState<string>('')
    
    useEffect(() => {
        const fetchedMedia = async () => {
            try {
                setIsLoading(true)
                const res = await fetch('/api/videos', {
                    cache: "no-store"
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                const data = await res.json();
                setMedia(data.body);
                setIsLoading(false)
            } catch (error: unknown) {
                console.error('Error fetching media:', error);
                setIsLoading(false)
                setError(error instanceof Error ? error.message : 'An error occurred');
            }
        }
       
        fetchedMedia();
    }, []);
    
    // Return the Loading component when data is still loading
    if(isLoading) {
        return <Loading />
    }
    
    return (
        <div className="h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark">
            <div className="flex justify-evenly mt-6 flex-wrap">
                {media.length > 0 ? (
                    media.map((video: Media) => (
                        <div
                            key={video.id}
                            className="card-green-glass w-[30%] h-53 my-8"
                        >
                            <div className="flex gap-4 justify-center">
                                <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
                                    <Link
                                        href={`/video/${video.platform}/${video.id}`}
                                    >
                                        <Image
                                            src={video.hdThumbnailUrl || ''}
                                            alt="Media thumbnail"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                            quality={95}
                                            className='object-cover opacity-90 rounded-2xl'
                                            onLoadingComplete={() => {}} // No need to set isLoading here
                                            // onMouseEnter={handleMouseEvent}
                                            // onMouseLeave={handleMouseEvent}
                                        />
                                    </Link>
                                </div>
                            </div>
                            <div className="span-prop relative flex top-54 rounded-[5px]">
                                <div>
                                    <span>{video.platform}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <NoContent />
                )}
            </div>
        </div>
    );
}
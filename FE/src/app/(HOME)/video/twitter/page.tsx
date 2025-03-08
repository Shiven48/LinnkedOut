'use client'
import { useEffect, useState } from "react";
import { TwitterMedia } from "../../../../../types";
import Card from "../../../_components/ThumbnailCard";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import NoContent from "@/app/_components/NoContent";

// Change here For twitter
export default function Youtube() {
    const [isLoading, setIsLoading] = useState(true)
    const [media, setMedia] = useState<TwitterMedia[]>([])

    useEffect(() => {
        const fetchedMedia = async () => {
            try {
                const res = await fetch('/api/videos/media/twitter', {
                    cache: "no-store"
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                const data = await res.json();
                setMedia(data.body);
            } catch (error: unknown) {
                console.error('Error fetching media:', error);
            }
        }
        fetchedMedia();
    }, []);

    console.log(media)

    return (
        <div className="h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark">
            <div className="flex justify-evenly mt-6 flex-wrap">
                {media.length > 0 ? (
                    media.map((video: TwitterMedia) => (
                        <div
                            key={video.id}
                            className="card-green-glass w-[30%] h-53 my-8"
                        >
                            <div className="flex gap-4 justify-center">
                                <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
                                    {isLoading && <Skeleton className="absolute inset-0 rounded-2xl" />}
                                    <Link
                                        href={`/video/twitter/${video.id}`}
                                    >
                                        <Image
                                            src={video.tweet_media_key || ''}
                                            alt="Media thumbnail"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                            quality={95}
                                            className='object-cover opacity-90 rounded-2xl'
                                            onLoadingComplete={() => setIsLoading(false)}
                                        // onMouseEnter={handleMouseEvent}
                                        // onMouseLeave={handleMouseEvent}
                                        />
                                    </Link>
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
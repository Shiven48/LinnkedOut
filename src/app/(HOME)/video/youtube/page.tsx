'use client'
import { useEffect, useState } from "react";
import { Media, YoutubeMedia } from "../../../../../types";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Youtube() {
    const [isLoading, setIsLoading] = useState(true)
    const [media, setMedia] = useState<YoutubeMedia[]>([])

    useEffect(() => {
        const fetchedMedia = async () => {
            try {
                const res = await fetch('/api/videos/media/youtube', {
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

    return (
        <div className="h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark">
            <div className="flex justify-evenly mt-6 flex-wrap">
                {media.length > 0 ? (
                    media.map((video: YoutubeMedia) => (
                        <div
                            key={video.id}
                            className="card-green-glass w-[30%] h-53 my-8"
                        >
                            <div className="flex gap-4 justify-center">
                                <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
                                    {isLoading && <Skeleton className="absolute inset-0 rounded-2xl" />}
                                    <Link
                                        href={`/video/youtube/${video.id}`}
                                    >
                                        <Image
                                            src={video.thumbnailMaxRes || ''}
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
                            <div className='flex justify-evenly'>
                                <div className="gap-5 rounded-2xl w-full h-full py-1 flex justify-evenly relative top-54">
                                    <Link
                                        className="span-prop basic-text button-hover"
                                        href='#'
                                    >
                                        {video.title}
                                    </Link>
                                    <Link
                                        className="span-prop basic-text button-hover"
                                        href="#"
                                    >
                                        { video.mediaId }
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
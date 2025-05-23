'use client'
import { useEffect, useState } from "react";
import { Media } from "../../../../../types";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
// import NoContent from "@/app/_components/shared/NoContent";
import Loading from "@/app/_components/shared/Loading";

export default function Youtube() {
    const [isLoading, setIsLoading] = useState(true)
    const [media, setMedia] = useState<Media[]>([])

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
            {
               <span className="text-gray-400 font-semibold font-sans flex relative top-5 justify-center">Results for Youtube Media</span>
            }
            <div className="flex justify-evenly mt-6 flex-wrap">
                {media.length > 0 ? (
                    media.map((video: Media) => (
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
                                            src={video.thumbnailUrl || ''}
                                            alt="Media thumbnail"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                            quality={95}
                                            className='object-cover opacity-90 rounded-2xl'
                                            onLoadingComplete={() => setIsLoading(false)}
                                            // On hover video play
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
                                        { video.id }
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
}
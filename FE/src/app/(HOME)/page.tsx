'use client'
import { useEffect, useState } from "react";
import { Media } from "../../../types";
import Link from "next/link";
import Image from "next/image";
import Loading from "../_components/shared/Loading";
import NoContent from "../_components/shared/NoContent";

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

    const viewTime = (durationMs:number):string => {
        const duration = durationMs / 1000;
        const hours = Math.floor(duration / 3600); 
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

    if(hours < 1){
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;    
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const getPlatformIcon = (platform:string) => {
        switch (platform.toLowerCase()) {
          case 'reddit': return '/reddit.svg'; 
          case 'youtube': return '/youtube.svg';
          default: return '🎬';
        }
      };

      const getTitle = (title:string):string => {
        if(title.length > 40){
            return title.slice(0,50).concat('...')
        }
        return title;
      }

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
                            className="card-green-glass w-[30%] h-64 my-8"
                        >
                            <div className="flex gap-4 justify-center">
                                <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
                                    <Link
                                        href={`/video/${video.platform}/${video.id}`}
                                    >
                                        <Image
                                            src={video.thumbnailUrl || ''}
                                            alt="Media thumbnail"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                            quality={95}
                                            className='object-cover opacity-90 rounded-2xl'
                                            onLoadingComplete={() => {}}
                                            // This is for onHoverPlay
                                            // onMouseEnter={handleMouseEvent}
                                            // onMouseLeave={handleMouseEvent}
                                        />
                                    </Link>
                                </div>
                            </div>
                            <div className="span-prop relative flex top-68 rounded-[5px] text-white">
                            <div className="w-10 h-6 absolute -top-14 end-2 bg-black bg-opacity-80 rounded text-center text-sm">
                                <span className="text-white flex items-center justify-center pt-1">{viewTime(video.durationMs)}</span>
                            </div>
                            <div className="w-10 h-6 absolute -top-64 start-2 bg-darker rounded text-center text-sm">
                                <span className="text-golden flex items-center justify-center pt-1">HD</span>
                            </div>
                                <div className="flex flex-col justify-evenly">
                                <span className="text-large text-white -mt-2">{getTitle(video.title)}</span>
                                <div className="flex items-center mb-1.5 justify-evenly">
                                    <div className="flex items-center justify-evently bg-opacity-70 bg-gray-800 rounded-full px-2 py-0.5 border border-white absolute -top-14 start-2">
                                        <Image 
                                            src={getPlatformIcon(video.platform)}
                                            width={16}
                                            height={16}
                                            alt={video.platform}
                                            className="mr-1"
                                        />
                                        <span className="text-xs font-medium text-gray-300">{video.platform}</span>
                                    </div>    
                                </div>
                                <span className="text-medium text-gray-400">{video.type}</span>
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
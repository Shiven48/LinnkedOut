'use client';

import React, { useEffect, useState } from "react";
import { useSidebarState } from "../../../../../hooks/useSideBarState";
import { Media } from "@/../../types";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import NoContent from "@/app/_components/shared/NoContent";
import Loading from "@/app/_components/shared/Loading";

export default function Category() {
    const [media, setMedia] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [decodedCategory, setDecodedCategory] = useState('');
    const isOpen = useSidebarState(state => state.isOpen);
    const { category } = useParams();

    useEffect(() => {
        if (typeof category !== 'string') return;

        const decoded = decodeURIComponent(category);
        setDecodedCategory(decoded);

        const fetchMedia = async () => {
            try {
                const res = await fetch(`/api/videos/category/${encodeURIComponent(category)}`, {
                    cache: "no-store"
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                const data = await res.json();
                setMedia(data.body);
            } catch (error) {
                console.error('Error fetching media:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMedia();
    }, [category]);

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

    return (
        <div className="h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark">
            <span className="text-white font-semibold font-sans flex relative top-5 justify-center">
                Results for {decodedCategory}
            </span>
            <div className="flex justify-evenly mt-6 flex-wrap">
                {isLoading ? (
                    <Loading />                    
                ) : media.length > 0 ? (
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

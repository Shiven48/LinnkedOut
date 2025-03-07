import Image from 'next/image';
import { Media, yt_media } from "../../../types";
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function YoutubeCard({ media }: { media: yt_media }){
        const [isLoading, setIsLoading] = useState(true)
        const [isHovered, setIsHovered] = useState(false)
        const { id, platform } = media

       useEffect(() => {
        handleMouseEvent()
       },[])

        const handleMouseEvent = () => {
            setIsHovered(prev => !prev)
        }

    console.log(media.hdThumbnailUrl)

    return(
        <div className="flex gap-4 justify-center">
            <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
            {isLoading && <Skeleton className="absolute inset-0 rounded-2xl" />}
            <Link 
                 href={`/video/${platform}/${id}`}            
            > 
                <Image
                    src={media.hdThumbnailUrl || null}
                    alt="Media thumbnail"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    quality={95}
                    className='object-cover opacity-90 rounded-2xl'
                    onLoadingComplete={() => setIsLoading(false)}
                    onMouseEnter={handleMouseEvent}
                    onMouseLeave={handleMouseEvent}
                />
            </Link>
            </div>
        </div>
    )
}
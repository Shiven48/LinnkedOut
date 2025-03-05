import Image from 'next/image';
import { Media } from "../../../types";
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import Link from 'next/link';

export default function Card({ media }: { media: Media }){
        const [isLoading, setIsLoading] = useState(true)
        const { id, platform } = media
    return(
        <div className="flex gap-4 justify-center">
            <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
            {isLoading && <Skeleton className="absolute inset-0 rounded-2xl" />}
            <Link 
                 href={`/video/${id}/${platform}`}            
            > 
                <Image
                    src={media.hdThumbnailUrl || ''}
                    alt="Media thumbnail"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    quality={95}
                    className='object-cover opacity-90 rounded-2xl'
                    onLoadingComplete={() => setIsLoading(false)}
                />
            </Link>
            </div>
        </div>
    )
}
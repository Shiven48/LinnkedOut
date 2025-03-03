import Image from 'next/image';
import { Media } from "../../../types";

export default function Card({ media }: { media: Media }){
    return(
        // This styling is just temporary
        <div className="flex gap-4 justify-center">
            <div className='aspect-video -z-90 rounded-2xl overflow-hidden'>
            <Image
                src={media.hdThumbnailUrl || ''}
                alt="Media thumbnail"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                quality={95}
                className='object-cover opacity-90 rounded-2xl'
            />
            </div>
        </div>
    )
}
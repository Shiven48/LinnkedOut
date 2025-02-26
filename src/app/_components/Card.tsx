import Image from 'next/image';
import { Media } from "../../../types";

export default function Card({ media }: { media: Media }){
    return(
        // This styling is just temporary
        <div className="text-black font-serif font-thin flex gap-4 justify-center">
            <div className='w-full h-full absolute -z-90 rounded-xl flex top-0'>
            <Image
                src={media.thumbnailUrl}
                alt="Media thumbnail"
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
                className='h-full w-full opacity-80 rounded-2xl'
            />
            </div>
        </div>
    )
}
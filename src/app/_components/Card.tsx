import Image from 'next/image';
import { Media } from "../../../types";

export default function Card({ media }: { media: Media }){
    return(
        // This styling is just temporary
        <div className="text-black m-2 font-serif font-thin flex gap-4 absolute bottom-4 items-center">
            <Image
                src={media.thumbnailUrl}
                alt="Media thumbnail"
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
            />
            <span className="px-1 bg-green-400 rounded-xl flex justify-center border border-black">{media.platform}</span>
            <span className="px-1 bg-orange-400 rounded-xl flex justify-center border border-black"> {media.type}</span>
            <span className="px-1 bg-gray-400 rounded-xl flex justify-center border border-black"> {new Date(media.createdAt).toDateString()}</span>
        </div>
    )
}
import { Media } from "../../../types";

export default function Card({ media }: { media: Media }){
    return(
        // This styling is just temporary
        <div className="text-black m-2 font-serif font-thin flex gap-4 absolute bottom-4 items-center justify-end">
        {/*<Image
            src=""
            alt=""
            width={0}
            height={0}
            /> */}
            <p className="w-20 h-6 bg-green-400 rounded-xl flex justify-center border border-black">{media.platform}</p>
            <p className="w-20 h-6 bg-orange-400 rounded-xl flex justify-center border border-black"> {media.type}</p>
            <p className="w-36 h-6 bg-gray-400 rounded-xl flex justify-center border border-black"> {new Date(media.createdAt).toDateString()}</p>
        </div>
    )
}
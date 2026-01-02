'use client'
import Image from "next/image"
import { useState } from "react";
import CommentsDisplay from "@/app/_components/comments/CommentsDisplay";
import { RedditMedia } from "@/services/common/types";

interface redditData {
    redditVideo: RedditMedia;
}
export const RedditCommentComponent = ({redditVideo} : redditData) => {
    const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);


    const handleCommentAction = () => {
        setIsCommentOpen(prev => !prev)
    }
    return (
        <>
            <div className="flex flex-row">
                {/* For button only */}
                <button className="min-w-24 h-8 mt-2 py-1 px-1 flex bg-red-700 justify-center rounded-large hover-nav bg-golden border-2 border-black"
                    onClick={handleCommentAction}>
                    Comments

                    <div className={`flex justify-start items-center cursor-pointer py-1 rounded-small `} >
                        {/* For arrow only */}
                        <div className={`rounded-full ml-2 flex`}>
                            <Image
                                src={isCommentOpen ? '/right.svg' : '/down.svg'}
                                alt="platform_toggle_arrow_right"
                                width={30}
                                height={30}
                                className={`transition-all duration-200 ease-in-out`}
                            />
                        </div>
                    </div>
                </button>
            </div>
            <div className={isCommentOpen ? `block` : `hidden`}>
                <CommentsDisplay comments={redditVideo?.comments ?? []} />
            </div>
        </>
    )

}
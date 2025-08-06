// 'use client'
// import { use, useEffect, useState, useRef } from "react";
// import { useSidebarState } from "../../../../../../../hooks/useSideBarState";
// import SideVideo from "@/app/_components/shared/SideVideo";
// import { Media, RedditMedia } from '@/services/common/types';
// import { usePlayingState } from "../../../../../../../hooks/useIsPlaying";
// import Loading from "@/app/_components/shared/Loading";
// import CommentsDisplay from "@/app/_components/comments/CommentsDisplay";
// import Link from "next/link";
// import Image from "next/image";
// import { RedditCommentComponent } from "@/app/_components/comments/RedditCommentComponent";

// export default function Reddit(
//   { params }: {
//     params: Promise<{
//       platformId: number;
//       videoId: number;
//     }>
//   }
// ) {

//   // Here i am getting generalized mediaId!!
//   const mediaId = use(params).videoId;
//   // Here i am getting redditId!!
//   const redditId = use(params).platformId;

//   const [video, setVideo] = useState<Media | null>(null);
//   const [redditVideo, setRedditVideo] = useState<RedditMedia | null>(null);
//   const [isHidden, setIsHidden] = useState<boolean>(false);
//   const isOpen = useSidebarState((state) => state.isOpen);
//   const isPlaying = usePlayingState((state) => state.isPlaying);
//   const setIsPlaying = usePlayingState((state) => state.setIsPlaying);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   // This is for the media
//   useEffect(() => {
//     const fetchDataById = async (mediaId: number) => {
//       try {
//         if (isOpen) {
//           useSidebarState.getState().setIsOpen(false);
//         }
//         const res = await fetch(`/api/videos/${mediaId}`);
//         if (!res.ok) {
//           throw new Error(`Error: ${res.statusText}`);
//         }
//         const data = await res.json();
//         setVideo(data.body);
//       } catch (error: unknown) {
//         console.error('Error fetching media:', error);
//       }
//     }
//     fetchDataById(mediaId);
//   }, [mediaId]);

//   // This is for the reddit media
//   useEffect(() => {
//     const fetchDataById = async (redditId: number) => {
//       try {
//         const res = await fetch(`/api/videos/media/reddit/${redditId}`);
//         if (!res.ok) {
//           throw new Error(`Error: ${res.statusText}`);
//         }
//         const data = await res.json();
//         setRedditVideo(data.body);
//       } catch (error: unknown) {
//         console.error('Error fetching media:', error);
//       }
//     }
//     fetchDataById(redditId);
//   }, [redditId])

//   const handleVideoEnded = () => {
//     setIsPlaying(false);
//   }

//   const handleVideoStateChange = () => {
//     if (videoRef.current) {
//       if (videoRef.current.paused) {
//         setIsPlaying(false);
//       } else {
//         setIsPlaying(true);
//       }
//     }
//   };

//   const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
//     e.preventDefault();
//     if (videoRef.current) {
//       if (videoRef.current.paused) {
//         videoRef.current.play();
//         setIsPlaying(true);
//       } else {
//         videoRef.current.pause();
//         setIsPlaying(false);
//       }
//     }
//   };

//   const handleHidden = () => {
//     setIsHidden(!isHidden);
//   };

//   return (
//     <div className={`overflow-y-auto pb-10 bg-dark flex flex-row h-screen w-screen smallScreenPlatform
//     ${isPlaying ? 'bg-darker transition-all duration-500' : 'transition-all duration-500'}
//   `}>

//     {/* First half components */}
//       <div className="w-full lg:w-[70%] h-[calc(100vh-48px)] overflow-y-auto scrollbar-hide bg-dark" id="For left Handed Components">
//         {/* The video Frame */}
//         <div className={`mt-5 ml-2 rounded-xl z-40 w-full lg:w-[95%] h-[60%] overflow-hidden relative transition-all duration-500
//      `}>
//           {video?.postUrl ? (
//             <video
//               ref={videoRef}
//               src={video.postUrl}
//               className="w-full h-full object-contain"
//               controls
//               onPlay={handleVideoStateChange}
//               onPause={handleVideoStateChange}
//               onEnded={handleVideoEnded}
//               onClick={handleVideoClick}
//             />
//           ) : video?.thumbnailUrl ? (
//             <div className="relative w-full h-full">
//               <Image
//                 src={video.thumbnailUrl}
//                 alt={video.title || "Video thumbnail"}
//                 fill
//                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
//                 priority
//                 className="object-contain"
//               />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="bg-black bg-opacity-50 p-2 rounded text-white">
//                   Video unavailable
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <Loading />
//           )}
//       </div>

//         {/* The video metadata */}
//         <div className="mt-6 space-y-2 relative sm:w-[60%] lg:w-[95%] ml-2">
//           <div className="flex justify-between">
//             <p className="text-white mb-2 text-xl">{video?.title}</p>
//             <div className="text-white mb-2">
//               {redditVideo?.postLink && (
//                 <Link href={redditVideo.postLink}>
//                   <div className={`w-32 h-8 flex bg-dark-golden border border-white rounded-xl hover:bg-golden
//                     hover-thread
//                   `}>
//                     <p className={`text-black flex items-center font-serif ml-9`}>Thread</p>
//                   </div>
//                 </Link>
//               )}
//             </div>
//           </div>

//           <div className="flex">
//             <span className="text-gray-400 text-xl">
//               {redditVideo?.subreddit && redditVideo.subreddit}
//               {redditVideo?.author && redditVideo.subreddit && " | "}
//               {redditVideo?.author && redditVideo.author}
//             </span>
//           </div>

//           {/* For Comment Section */}
//           <RedditCommentComponent redditVideo={redditVideo!}/>
//         </div>
//       </div>

//       {/* Second half components */}
//       <div className="smallSecondHalfComponents scrollbar-hide overflow-y-auto bg-dark" id="For right Handed Components">
//         {/* <SideChat /> */}
//         <SideVideo />
//       </div>
//     </div>
//   );
// }

import NoContent from '@/app/_components/shared/NoContent';

export default function Reddit(){
    return(
        <NoContent/>
    )
}
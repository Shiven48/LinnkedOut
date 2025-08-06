'use client'
// import { useState } from "react";
// import { Media, PaginationInfo } from '@/services/common/types';
// import { Pagination } from "../Server/Pagination";
// import { usePlayingState } from "../../../../hooks/useIsPlaying";
// import Loading from "./Loading";
// import NoContent from "./NoContent";
// import Card from "./Card";

// interface ExtendedMedia extends Media {
//   platformId?: number;
// }

// interface HomeProps {
//   media: ExtendedMedia[];
//   pagination: PaginationInfo;
//   pageHeader?: string
// }

// export default function Home({ media, pagination, pageHeader }: HomeProps) {
    
//     const [isLoading, setIsLoading] = useState(false);
//     const { currentPage, totalPages } = pagination;
//     const isPlaying = usePlayingState((state) => state.isPlaying);
    
//     if (isLoading) return <Loading />;
   
//     return (
//         <div className={`h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark scrollbar-hide
//             ${isPlaying ? 'bg-blend-darken brightness-50 bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
//         `}>
//             {/* The title on top/starting of the page */}
//             {(pageHeader && media?.length > 0) &&  (
//                 <span className="MainHeaderTitle">{pageHeader}</span>
//             )}

//             {/* This is for displaying Card of each media */}
//             <div className="flex justify-evenly mt-2 flex-wrap">
//                 {media.length > 0 ? (
//                     media.map((video:any) => (
//                         <div
//                             key={video.id}
//                             className={`card-green-glass h-64 mt-4 mb-16 mediumScreenCard smallScreenCard w-[32%]`}
//                         >
//                             <Card video={video} />
//                         </div>
//                     ))
//                 ) : (
//                     <NoContent />
//                 )}
//             </div>

//             {/* Pagination Component */}
//             <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//             />
//         </div>
//     );
// }


// // Container
// // {`h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark scrollbar-hide
// //         ${isPlaying ? 'bg-blend-darken brightness-50 bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
// //  `}
// // const [isLoading, setIsLoading] = useState(false)
// //     const { currentPage, totalPages } = pagination;
// //     const isPlaying = usePlayingState((state) => state.isPlaying);

// //     if(isLoading) return <Loading />
    
// //     return (
// //         <div className={`h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark scrollbar-hide
// //             ${isPlaying ? 'bg-blend-darken brightness-50 bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
// //         `}>
// //             { pageHeader && (
// //                 <span className="MainHeaderTitle">${pageHeader}</span>) 
// //             }
// //             <div className="flex justify-evenly mt-2 flex-wrap">
// //                 {media.length > 0 ? (
// //                     media.map((video: ExtendedMedia) => (
// //                         <div
// //                             key={ video.id }
// //                             className={`card-green-glass h-64 mt-4 mb-16 mediumScreenCard smallScreenCard w-[32%]`}
// //                         >
// //                             <VideoCard video={video} />
// //                         </div>
// //                     ))
// //                 ) : (
// //                     <NoContent />
// //                 )}
// //             </div>

// //             {/* Pagination Component (Render the pagination strip) */}
// //             <Pagination 
// //                 currentPage={currentPage} 
// //                 totalPages={totalPages}
// //             />

// //         </div>
// //     );


import NoContent from '@/app/_components/shared/NoContent';
import { usePlayingState } from '../../../../hooks/useIsPlaying';

export default function Home(){
    const isPlaying = usePlayingState((state) => state.isPlaying);

    return(
        <div className={`h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark scrollbar-hide
             ${isPlaying ? 'bg-blend-darken brightness-50 bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
        `}>
            <NoContent />
        </div>
    )
}
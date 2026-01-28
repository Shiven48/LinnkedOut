import { NextRequest, NextResponse } from "next/server";
import { FormDataType } from "@/app/_components/shared/PostInputForm";
import { HelperFunctions } from "@/lib/helper_funcs";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// export async function GET() {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json(
//         { message: "Error fetching videos", error: "unauthorised" },
//         { status: 401 }
//       );

//     const youtubeOrchestrator = new YoutubeOrchestrator();
//     const redditOrchestrator = new RedditOrchestrator();
//     const apiService = new RedditAPIService();
//     const redditMetadataService = new RedditMetadataSevice();

//     const mappedVideo = await youtubeOrchestrator.mainYoutubeOrchestrator(
//       Resources()[13].link,
//       userId
//     );
//     // const mappedVideo = await redditOrchestrator.mainRedditOrchestrator(Resources()[14].link)

//     const query = `learning skills graphics programming game engine development opengl vulkan technical skills programming tutorials code implementation software development advanced learning learning skills graphics programming game engine development opengl vulkan technical skills programming tutorials career development technology software development`;
//     const redditVideos = await apiService.fetchMultipleRDTVideosFromQuery(
//       query
//     );
//     const ids: string[] = redditMetadataService.extractAllIds(redditVideos);

//     // here fetching comments of 20 videos by their ids
//     const comments: any[] = await apiService.fetchCommentsFromIds(ids);

//     // const result:CommentData[][] = comments.map((videoComment:any) => {
//     //     // This gives comments of every single video
//     //     return redditMetadataService.extractTopComments(videoComment);
//     // })

//     let ArrayOfChildrenCommentObjects: Array<Array<any>> = [];
//     // let ArrayOfCommentObjects: Array<any> = [];

//     // This is Array<Array<any>>
//     comments.forEach((innerdata) => {
//       ArrayOfChildrenCommentObjects.push(innerdata?.[1]?.data?.children ?? []);
//     });

//     let res = null;

//     // This is Array<any>
//     ArrayOfChildrenCommentObjects.forEach((ArrayofCommentObjects: any[]) => {
//       const sortedComments = ArrayofCommentObjects.sort(
//         (a, b) => b.data.score - a.data.score
//       );

//       const topComments: CommentData[] = sortedComments
//         .slice(0, 10)
//         .map((comment) => {
//           const result: CommentData = {
//             body: comment.data.body,
//             score: comment.data.score,
//             author: comment.data.author,
//             ups: comment.data.ups,
//             downs: comment.data.downs,
//           };

//           const extractRpls = redditMetadataService.extractNestedReplies(
//             comment.data.replies
//           );

//           if (extractRpls && extractRpls.length > 0) {
//             result.replies = extractRpls;
//           }

//           return result;
//         });

//       res = topComments;
//       return topComments;
//     });

//     return NextResponse.json(res);
//   } catch (error: any) {
//     console.error("Caught error in GET handler:", error.message);
//     return new NextResponse(
//       JSON.stringify({
//         message: "Error fetching videos",
//         error: error.message,
//       }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//     try {
//         // Parse the JSON body from the request
//         const formData: FormDataType = await request.json();
//         console.log('Received form data:', JSON.stringify(formData, null, 2));

//         // Validate required fields
//         if (!formData.url || formData.url.length === 0) {
//             return NextResponse.json(
//                 {
//                     body: { error: 'URL list cannot be empty' },
//                     status: 400
//                 },
//                 { status: 400 }
//             );
//         }

//         if (!formData.category) {
//             return NextResponse.json(
//                 {
//                     body: { error: 'Category is required' },
//                     status: 400
//                 },
//                 { status: 400 }
//             );
//         }

//         console.log('Starting RootOrchestrator processing...');
//         // const orchestratorResult = await HelperFunctions.RootOrchestrator(formData);
//         console.log('RootOrchestrator completed successfully');

//         const result = orchestratorResult.map(data => {
//             return data.mediaData
//         })

//         const responseData:ApiResultResponse = {
//             message: 'Content processed successfully!',
//             formData: {
//                     urls: formData.url,
//                     category: formData.category,
//                     customTags: formData.customTags,
//                     fetchSimilar: formData.fetchSimilar,
//                     similarityLevel: formData.similarityLevel,
//                     contentType: formData.contentType
//                 },
//                 videos: result,
//                 totalVideos: orchestratorResult.length,
//                 processedAt: new Date().toISOString()
//             };

//         return NextResponse.json({
//             body: responseData,
//             status: 200
//         });

//     } catch (error: any) {
//         console.error("Error processing form submission:", error);

//         // Handle different types of errors
//         if (error instanceof SyntaxError) {
//             return NextResponse.json(
//                 {
//                     body: { error: 'Invalid JSON format in request body' },
//                     status: 400
//                 },
//                 { status: 400 }
//             );
//         }

//         // Handle orchestrator-specific errors
//         if (error.message && error.message.includes('Invalid link format')) {
//             return NextResponse.json(
//                 {
//                     body: { error: 'Invalid URL format provided', details: error.message },
//                     status: 400
//                 },
//                 { status: 400 }
//             );
//         }

//         if (error.message && error.message.includes('Unsupported platform')) {
//             return NextResponse.json(
//                 {
//                     body: { error: 'Unsupported platform detected', details: error.message },
//                     status: 400
//                 },
//                 { status: 400 }
//             );
//         }

//         // Generic error handling
//         return NextResponse.json(
//             {
//                 body: {
//                     error: 'Internal server error',
//                     details: error.message,
//                     timestamp: new Date().toISOString()
//                 },
//                 status: 500
//             },
//             { status: 500 }
//         );
//     }
// }

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { message: "Error fetching videos", error: "unauthorised" },
        { status: 401 }
      );

    // Parse the JSON body from the request
    const formData: FormDataType = await request.json();
    // console.log('Received form data:', JSON.stringify(formData, null, 2));

    // Validate required fields
    if (!formData.url || formData.url.length === 0) {
      return NextResponse.json(
        {
          body: { error: "URL list cannot be empty" },
          status: 400,
        },
        { status: 400 }
      );
    }

    if (!formData.category) {
      return NextResponse.json(
        {
          body: { error: "Category is required" },
          status: 400,
        },
        { status: 400 }
      );
    }

    console.log("Starting RootOrchestrator processing...");
    const orchestratorResult = await HelperFunctions.orchestrateFlow(formData, userId);
    console.log("RootOrchestrator completed successfully");
    revalidatePath("/");
    return NextResponse.json(orchestratorResult);
  } catch (error: any) {
    console.error("Error processing form submission:", error);

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          body: { error: "Invalid JSON format in request body" },
          status: 400,
        },
        { status: 400 }
      );
    }

    // Handle orchestrator-specific errors
    if (error.message && error.message.includes("Invalid link format")) {
      return NextResponse.json(
        {
          body: {
            error: "Invalid URL format provided",
            details: error.message,
          },
          status: 400,
        },
        { status: 400 }
      );
    }

    if (error.message && error.message.includes("Unsupported platform")) {
      return NextResponse.json(
        {
          body: {
            error: "Unsupported platform detected",
            details: error.message,
          },
          status: 400,
        },
        { status: 400 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        body: {
          error: "Internal server error",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        status: 500,
      },
      { status: 500 }
    );
  }
}
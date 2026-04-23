
import { NextRequest, NextResponse } from "next/server";
import { FormDataType } from "@/app/_components/shared/PostInputForm";
import { HelperFunctions } from "@/lib/helper_funcs";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { message: "Error fetching videos", error: "unauthorised" },
      { status: 401 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        const formData: FormDataType = await request.json();

        // Validate required fields
        if (!formData.url || formData.url.length === 0) {
          sendUpdate({ type: "error", message: "URL list cannot be empty" });
          controller.close();
          return;
        }

        if (!formData.category) {
          sendUpdate({ type: "error", message: "Category is required" });
          controller.close();
          return;
        }

        console.log("Starting OrchestrateIngestionPipeline...");
        const result = await HelperFunctions.OrchestrateIngestionPipeline(
          formData,
          userId,
          (message) => sendUpdate({ type: "log", message })
        );

        sendUpdate({ type: "done", data: result });
        controller.close();
      } catch (error: any) {
        console.error("Error processing form submission:", error);
        sendUpdate({
          type: "error",
          message: error.message || "Internal server error",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
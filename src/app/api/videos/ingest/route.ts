
import { NextRequest, NextResponse } from "next/server";
import { FormDataType } from "@/app/_components/shared/PostInputForm";
import { HelperFunctions } from "@/lib/helper_funcs";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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
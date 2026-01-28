import { SummaryService } from "@/services/content/summaryService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { captionbody } = body;
   
    if (!captionbody || typeof captionbody !== 'string') {
      return NextResponse.json(
        { error: 'Captions string is required' },
        { status: 400 }
      );
    }
   
    console.log(`Processing summary for captions, length: ${captionbody.length} characters`);
    const summaryServiceObj = new SummaryService();
    
    return await summaryServiceObj.generateSummary(captionbody);
  } catch (error) {
    console.error('Error in summarize API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
   
    return NextResponse.json(
      { error: 'Failed to summarize text', message: errorMessage },
      { status: 500 }
    );
  }
}
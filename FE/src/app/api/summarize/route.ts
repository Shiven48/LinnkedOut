import { summaryService } from "@/services/summaryService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { caption } = body;
    
    // Validate the input
    if (!caption || typeof caption !== 'string') {
      return NextResponse.json(
        { error: 'Captions string is required' },
        { status: 400 }
      );
    }
    
    console.log(`Processing summary for captions, length: ${caption.length} characters`);
    const summaryServiceObj = new summaryService();
    const summarizedText:string = await summaryServiceObj.generateSummary(caption);
    
    return NextResponse.json({ body: summarizedText, status:200 });
  } catch (error) {
    console.error('Error in summarize API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to summarize text', message: errorMessage },
      { status: 500 }
    );
  }
}
import { NextRequest } from "next/server";
import { eventBus } from "@/services/common/eventBus";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection successful message
      controller.enqueue(`data: ${JSON.stringify({ message: "Starting process..." })}\n\n`);

      const logListener = (message: string) => {
        controller.enqueue(`data: ${JSON.stringify({ message })}\n\n`);
      };

      const completeListener = () => {
        controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
        controller.close();
        eventBus.off(`log-${userId}`, logListener);
        eventBus.off(`complete-${userId}`, completeListener);
      };

      eventBus.on(`log-${userId}`, logListener);
      eventBus.on(`complete-${userId}`, completeListener);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        eventBus.off(`log-${userId}`, logListener);
        eventBus.off(`complete-${userId}`, completeListener);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  // Fetch initial batch and establish the cursor
  const initial = await prisma.eventLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  let lastCreatedAt = initial.length > 0
    ? new Date(initial[0].createdAt)
    : new Date();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial events oldest-first so the client can prepend them into the right order
      for (const event of [...initial].reverse()) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      // Poll every 2s for events newer than the cursor
      const interval = setInterval(async () => {
        try {
          const next = await prisma.eventLog.findMany({
            where: { createdAt: { gt: lastCreatedAt } },
            orderBy: { createdAt: "asc" },
          });

          for (const event of next) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
            lastCreatedAt = new Date(event.createdAt);
          }
        } catch {
          // client disconnected — interval will be cleared below
        }
      }, 2000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

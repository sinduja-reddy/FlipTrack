import { NextRequest, NextResponse } from "next/server";
import { ItemsService } from "@/lib/items/items.service";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/items/[id]">
) {
  const { id } = await ctx.params;

  try {
    const item = await ItemsService.getById(id);
    return NextResponse.json(item);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}

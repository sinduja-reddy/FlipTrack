import { NextRequest, NextResponse } from "next/server";
import { ItemsService } from "@/lib/items/items.service";
import type { ItemFilters } from "@/lib/items/items.types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const filters: ItemFilters = {
    storefront: sp.get("storefront") ?? undefined,
    category: sp.get("category") ?? undefined,
    status: sp.get("status") ?? undefined,
    q: sp.get("q") ?? undefined,
  };

  const items = await ItemsService.list(filters);
  return NextResponse.json(items);
}

import { NextRequest, NextResponse } from "next/server";
import { ItemsService } from "@/lib/items/items.service";
import { ValidationError } from "@/lib/errors";
import type { ItemFilters } from "@/lib/items/items.types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const filters: ItemFilters = {
    storefront: sp.get("storefront") ?? undefined,
    category:   sp.get("category") ?? undefined,
    status:     sp.get("status") ?? undefined,
    q:          sp.get("q") ?? undefined,
  };

  const items = await ItemsService.list(filters);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await ItemsService.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}

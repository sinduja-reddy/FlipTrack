import { NextResponse } from "next/server";
import { StorefrontsService } from "@/lib/storefronts/storefronts.service";

export async function GET() {
  const storefronts = await StorefrontsService.list();
  return NextResponse.json(storefronts);
}

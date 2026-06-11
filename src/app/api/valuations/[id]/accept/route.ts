import { NextRequest, NextResponse } from "next/server";
import { ValuationsService } from "@/lib/valuations/valuations.service";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/valuations/[id]/accept">
) {
  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const { acceptedValue, appraiserNote } = body;

    if (!acceptedValue || isNaN(Number(acceptedValue))) {
      return NextResponse.json({ error: "acceptedValue is required" }, { status: 400 });
    }

    const valuation = await ValuationsService.accept({
      valuationId: id,
      acceptedValue: Number(acceptedValue),
      appraiserNote: appraiserNote ?? undefined,
    });

    return NextResponse.json(valuation);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}

import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getPlace } from "@/lib/db/places";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const place = await getPlace(id);
  if (!place) return apiError(404, "not_found", "Không tìm thấy địa điểm");
  return NextResponse.json(place);
}

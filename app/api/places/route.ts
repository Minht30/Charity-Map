import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api/errors";
import { isCategorySlug, type CategorySlug } from "@/lib/categories";
import { listPlaces } from "@/lib/db/places";

const querySchema = z.object({
  bbox: z
    .string()
    .transform((s) => s.split(",").map(Number))
    .refine((a) => a.length === 4 && a.every(Number.isFinite), "bbox phải có 4 số")
    .transform((a) => a as [number, number, number, number]),
  categories: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(",").filter(Boolean) : []))
    .refine((a) => a.every(isCategorySlug), "Có loại không hợp lệ")
    .transform((a) => a as CategorySlug[]),
  limit: z.coerce.number().int().min(1).max(2000).default(500),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return apiError(400, "bad_query", parsed.error.issues[0]?.message ?? "Truy vấn không hợp lệ");
  }
  const points = await listPlaces(parsed.data);
  return NextResponse.json({
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: p.location },
      properties: { id: p.id, title: p.title, category: p.category, approximate: p.approximate, stale: p.stale },
    })),
  });
}

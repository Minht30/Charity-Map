import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { fuzzLocation } from "@/lib/privacy/fuzz";
import { DEMO_PLACES } from "./demo-places";
import type { PlaceDetail, PlacePoint, PlaceQuery, PlaceRecord } from "./types";

/**
 * Lớp đọc dữ liệu địa điểm. Hiện chỉ có nguồn dữ liệu mẫu; khi nối Supabase (T015, T020) thì
 * đọc view `places_public` ở đây và giữ nguyên các kiểu trả về để giao diện không phải đổi.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
export const STALE_AFTER_DAYS = 90;
export const HIDE_AFTER_DAYS = 180;

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function ageDays(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / DAY_MS;
}

export function isApproximate(p: PlaceRecord): boolean {
  return p.locationType === "roaming" || CATEGORY_BY_SLUG[p.category].forcesRoaming;
}

function publicLocation(p: PlaceRecord): [number, number] {
  const [lng, lat] = p.locationExact;
  return isApproximate(p) ? fuzzLocation(p.id, lng, lat) : [lng, lat];
}

export function toPoint(p: PlaceRecord, now = new Date()): PlacePoint {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    approximate: isApproximate(p),
    stale: ageDays(p.lastConfirmedAt, now) > STALE_AFTER_DAYS,
    location: publicLocation(p),
  };
}

export function toDetail(p: PlaceRecord, now = new Date()): PlaceDetail {
  return {
    ...toPoint(p, now),
    description: p.description,
    helpTypes: p.helpTypes,
    hours: p.hours,
    area: p.area,
    lastConfirmedAt: p.lastConfirmedAt,
    sources: p.sources,
  };
}

function visible(p: PlaceRecord, now: Date): boolean {
  return ageDays(p.lastConfirmedAt, now) <= HIDE_AFTER_DAYS;
}

export function filterPoints(records: readonly PlaceRecord[], q: PlaceQuery, now = new Date()): PlacePoint[] {
  const cats = q.categories?.length ? new Set(q.categories) : null;
  const out: PlacePoint[] = [];
  for (const r of records) {
    if (!visible(r, now)) continue;
    if (cats && !cats.has(r.category)) continue;
    const point = toPoint(r, now);
    if (q.bbox) {
      const [minLng, minLat, maxLng, maxLat] = q.bbox;
      const [lng, lat] = point.location;
      if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;
    }
    out.push(point);
    if (q.limit && out.length >= q.limit) break;
  }
  return out;
}

export async function listPlaces(q: PlaceQuery): Promise<PlacePoint[]> {
  return filterPoints(DEMO_PLACES, q);
}

export async function getPlace(id: string): Promise<PlaceDetail | null> {
  const now = new Date();
  const record = DEMO_PLACES.find((p) => p.id === id);
  if (!record || !visible(record, now)) return null;
  return toDetail(record, now);
}

import { WEEKDAY_VI } from "@/lib/i18n/vi";
import type { PlaceHours } from "@/lib/db/types";

/** "06:00" → "6g", "18:30" → "18g30" (cách viết giờ quen thuộc). */
export function formatTime(t: string): string {
  const [h = "0", m = "00"] = t.split(":");
  return `${Number(h)}g${m === "00" ? "" : m}`;
}

export function formatHours(h: PlaceHours): string {
  const day = h.weekday === null ? "Mỗi ngày" : WEEKDAY_VI[h.weekday];
  return `${day}, ${formatTime(h.start)} – ${formatTime(h.end)}`;
}

/** Link chỉ đường mở ứng dụng bản đồ quen thuộc của người dùng. Chỉ dùng toạ độ công khai. */
export function directionsUrl([lng, lat]: [number, number]): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

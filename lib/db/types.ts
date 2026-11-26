import type { CategorySlug } from "@/lib/categories";
import type { HelpType } from "@/lib/help-types";

export type LocationType = "fixed" | "roaming";

export interface PlaceHours {
  /** 0 = Chủ nhật … 6 = Thứ 7; null = mỗi ngày */
  weekday: number | null;
  start: string; // "06:00"
  end: string; // "11:00"
}

export interface SourceLink {
  url: string;
  kind: "post" | "reel" | "video";
}

/** Bản ghi đầy đủ, chỉ tồn tại phía server (giống bảng `places`). */
export interface PlaceRecord {
  id: string;
  title: string;
  description: string;
  category: CategorySlug;
  locationType: LocationType;
  /** [lng, lat] chính xác. Không bao giờ gửi cho người xem. */
  locationExact: [number, number];
  helpTypes: HelpType[];
  hours: PlaceHours[];
  /** Tên khu vực để hiển thị, vd "Quận 1 cũ" */
  area: string;
  lastConfirmedAt: string; // ISO
  sources: SourceLink[];
}

/** Điểm trên bản đồ (GET /api/places). */
export interface PlacePoint {
  id: string;
  title: string;
  category: CategorySlug;
  approximate: boolean;
  stale: boolean;
  /** [lng, lat] công khai (đã làm mờ nếu cần) */
  location: [number, number];
}

/** Chi tiết công khai (GET /api/places/:id). Không có trường liên hệ nào (FR-014). */
export interface PlaceDetail extends PlacePoint {
  description: string;
  helpTypes: HelpType[];
  hours: PlaceHours[];
  area: string;
  lastConfirmedAt: string;
  sources: SourceLink[];
}

export interface PlaceQuery {
  bbox?: [number, number, number, number];
  categories?: CategorySlug[];
  limit?: number;
}

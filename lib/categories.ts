/**
 * Danh mục hiển thị. Màu ở đây chỉ là màu tạm để phân biệt các điểm trên bản đồ;
 * khi có token từ Figma thì thay ở một chỗ này.
 */
export type CategorySlug =
  | "ban-ve-so"
  | "cu-gia-ban-hang"
  | "can-ho-tro-dac-biet"
  | "vo-gia-cu"
  | "diem-phat-do-an"
  | "ghe-tham"
  | "khac";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Tên ngắn cho ô lọc trên điện thoại */
  short: string;
  color: string;
  /** Luôn làm mờ vị trí, dù người đăng chọn "cố định" (FR-008) */
  forcesRoaming: boolean;
}

export const CATEGORIES: readonly Category[] = [
  { slug: "ban-ve-so", name: "Người bán vé số", short: "Bán vé số", color: "#c2410c", forcesRoaming: false },
  { slug: "cu-gia-ban-hang", name: "Cụ già bán hàng", short: "Cụ già bán hàng", color: "#1d4ed8", forcesRoaming: false },
  { slug: "can-ho-tro-dac-biet", name: "Cần hỗ trợ đặc biệt", short: "Hỗ trợ đặc biệt", color: "#7e22ce", forcesRoaming: false },
  { slug: "vo-gia-cu", name: "Người vô gia cư", short: "Vô gia cư", color: "#4b5563", forcesRoaming: true },
  { slug: "diem-phat-do-an", name: "Điểm phát đồ ăn", short: "Phát đồ ăn", color: "#15803d", forcesRoaming: false },
  { slug: "ghe-tham", name: "Nhà có thể ghé thăm", short: "Ghé thăm", color: "#b45309", forcesRoaming: false },
  { slug: "khac", name: "Khác", short: "Khác", color: "#0f766e", forcesRoaming: false },
];

export const CATEGORY_BY_SLUG: Record<CategorySlug, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>;

export function isCategorySlug(value: string): value is CategorySlug {
  return value in CATEGORY_BY_SLUG;
}

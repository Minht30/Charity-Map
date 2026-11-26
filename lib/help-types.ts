export type HelpType = "buy_goods" | "bring_food" | "bring_items" | "visit_chat" | "share" | "volunteer";

/** Các cách giúp không phải tiền (hiến chương nguyên tắc IV). */
export const HELP_TYPE_LABEL: Record<HelpType, string> = {
  buy_goods: "Mua hàng ủng hộ",
  bring_food: "Mang đồ ăn",
  bring_items: "Mang đồ dùng, quần áo",
  visit_chat: "Ghé thăm, trò chuyện",
  share: "Chia sẻ cho người khác biết",
  volunteer: "Góp công",
};

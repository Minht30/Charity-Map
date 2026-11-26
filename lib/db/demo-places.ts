import type { CategorySlug } from "@/lib/categories";
import type { HelpType } from "@/lib/help-types";
import type { LocationType, PlaceHours, PlaceRecord } from "./types";

/**
 * 30 điểm MẪU để thử bản đồ (T019). Đây không phải người thật: tên, mô tả, giờ giấc đều bịa,
 * vị trí rải quanh trung tâm TP.HCM. Không có link Facebook vì không được gắn bài của người thật
 * vào hoàn cảnh bịa. Chỉ dùng khi chưa nối Supabase.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString();
const everyDay = (start: string, end: string): PlaceHours[] => [{ weekday: null, start, end }];

type Row = [
  title: string,
  category: CategorySlug,
  type: LocationType,
  lng: number,
  lat: number,
  area: string,
  help: HelpType[],
  hours: PlaceHours[],
  confirmedDaysAgo: number,
  description: string,
];

const ROWS: Row[] = [
  ["Cô bán vé số ở góc ngã tư", "ban-ve-so", "fixed", 106.6983, 10.7725, "Quận 1 cũ", ["buy_goods", "visit_chat"], everyDay("06:00", "11:00"), 5, "Cô ngồi cố định ở góc đường mỗi sáng. Mua ủng hộ vài tờ hoặc hỏi thăm cô vài câu."],
  ["Chú bán vé số đi xe lăn", "ban-ve-so", "roaming", 106.7031, 10.7769, "Quận 1 cũ", ["buy_goods", "bring_food"], everyDay("07:00", "17:00"), 12, "Chú đi quanh khu phố đi bộ, hay nghỉ trưa dưới bóng cây."],
  ["Bà cụ bán vé số trước nhà thờ", "ban-ve-so", "fixed", 106.6889, 10.7801, "Quận 3 cũ", ["buy_goods"], everyDay("15:00", "20:00"), 20, "Bà bán buổi chiều tới tối."],
  ["Anh bán vé số bị khiếm thị", "ban-ve-so", "roaming", 106.6662, 10.7593, "Quận 5 cũ", ["buy_goods", "visit_chat"], everyDay("08:00", "18:00"), 3, "Anh đi theo tuyến chợ, nghe tiếng gọi là dừng lại."],
  ["Hai mẹ con bán vé số", "ban-ve-so", "fixed", 106.6725, 10.7712, "Quận 10 cũ", ["buy_goods", "bring_items"], everyDay("06:30", "12:00"), 40, "Ngồi trước tiệm tạp hoá. Bé đang đi học, cần sách vở cũ."],
  ["Ông bán vé số gần cầu", "ban-ve-so", "fixed", 106.7090, 10.8016, "Bình Thạnh cũ", ["buy_goods"], everyDay("05:30", "10:30"), 100, "Ông bán từ sáng sớm."],
  ["Cô bán vé số ở chợ", "ban-ve-so", "fixed", 106.6808, 10.7987, "Phú Nhuận cũ", ["buy_goods", "visit_chat"], everyDay("06:00", "14:00"), 8, "Ngồi ở cổng phụ của chợ."],
  ["Chú bán vé số đạp xe", "ban-ve-so", "roaming", 106.6950, 10.7880, "Quận 3 cũ", ["buy_goods"], everyDay("07:00", "19:00"), 15, "Chú đạp xe quanh các con hẻm."],
  ["Cụ bà bán bánh tráng", "cu-gia-ban-hang", "fixed", 106.6941, 10.7684, "Quận 1 cũ", ["buy_goods", "visit_chat"], everyDay("14:00", "21:00"), 6, "Cụ ngoài 80 tuổi, vẫn tự làm bánh tráng trộn."],
  ["Ông cụ bán đậu phộng luộc", "cu-gia-ban-hang", "roaming", 106.7008, 10.7832, "Quận 1 cũ", ["buy_goods"], everyDay("17:00", "22:00"), 25, "Ông gánh hàng đi buổi tối."],
  ["Bà bán chè trước hẻm", "cu-gia-ban-hang", "fixed", 106.6834, 10.7651, "Quận 3 cũ", ["buy_goods", "visit_chat"], everyDay("13:00", "19:00"), 10, "Chè đậu, chè bắp nấu tại nhà."],
  ["Ông cụ bán khoai lang nướng", "cu-gia-ban-hang", "fixed", 106.6612, 10.7536, "Quận 5 cũ", ["buy_goods"], everyDay("16:00", "21:00"), 30, "Lò than nhỏ bên đường."],
  ["Cụ bà bán rau trước chợ", "cu-gia-ban-hang", "fixed", 106.6770, 10.7603, "Quận 10 cũ", ["buy_goods", "bring_items"], everyDay("05:00", "09:00"), 18, "Rau nhà trồng, bán xong sớm."],
  ["Ông bán chổi, đồ đan tay", "cu-gia-ban-hang", "roaming", 106.7142, 10.8057, "Bình Thạnh cũ", ["buy_goods", "share"], everyDay("08:00", "16:00"), 45, "Ông tự đan chổi và rổ, đi bán quanh khu dân cư."],
  ["Bà bán xôi buổi sáng", "cu-gia-ban-hang", "fixed", 106.6862, 10.7952, "Phú Nhuận cũ", ["buy_goods"], everyDay("05:30", "09:00"), 4, "Xôi đậu xanh, xôi bắp."],
  ["Tiệm sửa xe của anh khiếm thính", "can-ho-tro-dac-biet", "fixed", 106.6905, 10.7745, "Quận 3 cũ", ["buy_goods", "share"], everyDay("07:00", "18:00"), 9, "Anh làm việc kỹ, giao tiếp bằng giấy bút."],
  ["Quán nước do người khuyết tật làm", "can-ho-tro-dac-biet", "fixed", 106.6698, 10.7680, "Quận 10 cũ", ["buy_goods", "volunteer"], everyDay("07:00", "20:00"), 14, "Các bạn tự pha chế và phục vụ. Ghé uống ủng hộ."],
  ["Chị bán đồ thủ công trên xe lăn", "can-ho-tro-dac-biet", "fixed", 106.7046, 10.7718, "Quận 1 cũ", ["buy_goods", "share"], everyDay("09:00", "17:00"), 22, "Móc khoá, túi len tự làm."],
  ["Tiệm massage người khiếm thị", "can-ho-tro-dac-biet", "fixed", 106.6795, 10.7905, "Phú Nhuận cũ", ["buy_goods", "share"], everyDay("09:00", "21:00"), 7, "Đặt chỗ trực tiếp tại tiệm."],
  ["Người ngủ dưới mái hiên", "vo-gia-cu", "roaming", 106.6965, 10.7708, "Quận 1 cũ", ["bring_food", "bring_items"], [], 11, "Thường ở quanh khu này về đêm. Cần áo mưa, đồ ăn khô."],
  ["Ông cụ nhặt ve chai", "vo-gia-cu", "roaming", 106.6740, 10.7560, "Quận 5 cũ", ["bring_food", "visit_chat"], [], 16, "Ông hay nghỉ ở công viên nhỏ."],
  ["Hai vợ chồng ngủ ở công viên", "vo-gia-cu", "roaming", 106.6872, 10.7860, "Quận 3 cũ", ["bring_food", "bring_items"], [], 28, "Cần mùng, chiếu, nước uống."],
  ["Bếp cơm 2.000 đồng", "diem-phat-do-an", "fixed", 106.6688, 10.7627, "Quận 10 cũ", ["volunteer", "bring_food"], [{ weekday: null, start: "10:30", end: "12:30" }], 2, "Cần người phụ nấu và dọn dẹp buổi trưa."],
  ["Tủ bánh mì miễn phí", "diem-phat-do-an", "fixed", 106.6927, 10.7826, "Quận 3 cũ", ["bring_food"], everyDay("06:00", "09:00"), 5, "Ai cần cứ lấy, ai có thì góp thêm."],
  ["Điểm phát cháo tối thứ Bảy", "diem-phat-do-an", "fixed", 106.7101, 10.7990, "Bình Thạnh cũ", ["volunteer", "bring_food"], [{ weekday: 6, start: "18:00", end: "20:00" }], 12, "Cần người múc cháo và người chở cháo đi phát."],
  ["Nhà cụ ông sống một mình", "ghe-tham", "fixed", 106.6646, 10.7577, "Quận 5 cũ", ["visit_chat", "bring_food"], [], 35, "Cụ thích có người tới nói chuyện buổi chiều."],
  ["Mái ấm nhỏ trong hẻm", "ghe-tham", "fixed", 106.6851, 10.7973, "Phú Nhuận cũ", ["visit_chat", "volunteer", "bring_items"], [{ weekday: 0, start: "08:00", end: "11:00" }], 19, "Sáng Chủ nhật đón khách tới chơi với các cháu."],
  ["Nhà bà cụ nuôi cháu", "ghe-tham", "fixed", 106.7160, 10.8030, "Bình Thạnh cũ", ["visit_chat", "bring_items"], [], 120, "Cháu đang tuổi đi học, cần sách vở và đồng phục."],
  ["Lớp học tình thương buổi tối", "khac", "fixed", 106.6760, 10.7740, "Quận 10 cũ", ["volunteer", "bring_items"], [{ weekday: null, start: "18:30", end: "20:30" }], 13, "Cần người dạy kèm và tập vở."],
  ["Tủ quần áo cho người cần", "khac", "fixed", 106.6990, 10.7905, "Quận 1 cũ", ["bring_items"], everyDay("07:00", "21:00"), 200, "Điểm này đã lâu không ai xác nhận nên bị ẩn (để thử quy tắc 180 ngày)."],
];

export const DEMO_PLACES: readonly PlaceRecord[] = ROWS.map(
  ([title, category, locationType, lng, lat, area, helpTypes, hours, confirmed, description], i) => ({
    id: `mau-${String(i + 1).padStart(2, "0")}`,
    title,
    description,
    category,
    locationType,
    locationExact: [lng, lat],
    helpTypes,
    hours,
    area,
    lastConfirmedAt: daysAgo(confirmed),
    sources: [],
  }),
);

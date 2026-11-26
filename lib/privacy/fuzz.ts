/**
 * Làm mờ vị trí cho điểm "không cố định" (FR-008, data-model.md `location_public`).
 *
 * Dịch điểm 200–400 m theo một hướng cố định suy ra từ `id`, nên đọc bao nhiêu lần cũng ra
 * cùng một chỗ: người xem không thể lấy trung bình nhiều lần đọc để đoán vị trí thật.
 * Khi có Supabase, trigger trong database làm việc này; hàm này dùng cho dữ liệu mẫu và để test.
 */

const METERS_PER_DEG_LAT = 111_320;
export const FUZZ_MIN_M = 200;
export const FUZZ_MAX_M = 400;

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Số trong [0, 1) cố định theo (id, salt). */
function unit(id: string, salt: string): number {
  return fnv1a(`${salt}:${id}`) / 0x1_0000_0000;
}

export function fuzzLocation(id: string, lng: number, lat: number): [number, number] {
  const distance = FUZZ_MIN_M + unit(id, "dist") * (FUZZ_MAX_M - FUZZ_MIN_M);
  const angle = unit(id, "angle") * 2 * Math.PI;
  const dLat = (distance * Math.cos(angle)) / METERS_PER_DEG_LAT;
  const dLng = (distance * Math.sin(angle)) / (METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

/** Khoảng cách xấp xỉ (m) giữa hai điểm, đủ chính xác ở phạm vi vài km. */
export function distanceMeters(a: [number, number], b: [number, number]): number {
  const meanLat = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (b[0] - a[0]) * METERS_PER_DEG_LAT * Math.cos(meanLat);
  const dy = (b[1] - a[1]) * METERS_PER_DEG_LAT;
  return Math.hypot(dx, dy);
}

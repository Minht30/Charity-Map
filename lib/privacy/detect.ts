/**
 * Phát hiện số điện thoại, số CCCD, số tài khoản trong chữ người dùng nhập (FR-014, T016).
 * Trả về vị trí đoạn vi phạm để form chỉ đúng chỗ cần xoá.
 */

export type SensitiveKind = "phone" | "id_or_account";

export interface SensitiveMatch {
  kind: SensitiveKind;
  start: number;
  end: number;
  text: string;
}

// Dãy chữ số, cho phép cách nhau bởi dấu cách, chấm, gạch (vd: 0903 123 456, 090.312.3456).
const DIGIT_RUN = /\+?\d(?:[\s.\-]?\d){7,}/g;

function classify(raw: string): SensitiveKind | null {
  const digits = raw.replace(/\D/g, "");
  const isPhone =
    (raw.startsWith("+84") && /^84[35789]\d{8}$/.test(digits)) ||
    /^0[35789]\d{8}$/.test(digits) ||
    /^02\d{9}$/.test(digits); // số bàn có mã vùng
  if (isPhone) return "phone";
  // CCCD 12 số, CMND 9 số, số tài khoản ngân hàng thường 8–19 số
  if (digits.length >= 8) return "id_or_account";
  return null;
}

export function findSensitive(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = [];
  for (const m of text.matchAll(DIGIT_RUN)) {
    const raw = m[0].trimEnd();
    const kind = classify(raw);
    if (kind && m.index !== undefined) {
      matches.push({ kind, start: m.index, end: m.index + raw.length, text: raw });
    }
  }
  return matches;
}

export function hasSensitive(text: string): boolean {
  return findSensitive(text).length > 0;
}

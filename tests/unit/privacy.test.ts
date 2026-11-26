import { describe, expect, it } from "vitest";
import { distanceMeters, fuzzLocation, FUZZ_MAX_M, FUZZ_MIN_M } from "@/lib/privacy/fuzz";
import { findSensitive, hasSensitive } from "@/lib/privacy/detect";

describe("fuzzLocation (FR-008)", () => {
  const exact: [number, number] = [106.6965, 10.7708];

  it("moves the point 200–400 m for many ids", () => {
    for (let i = 0; i < 500; i++) {
      const d = distanceMeters(exact, fuzzLocation(`id-${i}`, ...exact));
      expect(d).toBeGreaterThanOrEqual(FUZZ_MIN_M - 1);
      expect(d).toBeLessThanOrEqual(FUZZ_MAX_M + 1);
    }
  });

  it("returns the same point every time for the same id", () => {
    expect(fuzzLocation("abc", ...exact)).toEqual(fuzzLocation("abc", ...exact));
  });

  it("points in different directions for different ids", () => {
    const a = fuzzLocation("a", ...exact);
    const b = fuzzLocation("b", ...exact);
    expect(a).not.toEqual(b);
  });
});

describe("findSensitive (FR-014)", () => {
  it.each([
    "Gọi cô 0903123456 nhé",
    "sđt 090 312 3456",
    "số 090.312.3456",
    "+84 903 123 456",
    "liên hệ 028 3822 1234",
  ])("flags phone number in %s", (text) => {
    const hits = findSensitive(text);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.kind).toBe("phone");
  });

  it("flags CCCD and bank account numbers", () => {
    expect(findSensitive("CCCD 079123456789")[0]?.kind).toBe("id_or_account");
    expect(findSensitive("STK 1903 4567 8901 23")[0]?.kind).toBe("id_or_account");
  });

  it("returns the position of the match", () => {
    const text = "abc 0903123456 xyz";
    const [hit] = findSensitive(text);
    expect(text.slice(hit!.start, hit!.end)).toBe("0903123456");
  });

  it.each(["Bán từ 6g tới 11g", "Hẻm 123/45 đường số 7", "Năm 2025, cụ 85 tuổi", "Giá 10.000 đồng"])(
    "does not flag ordinary text: %s",
    (text) => {
      expect(hasSensitive(text)).toBe(false);
    },
  );
});

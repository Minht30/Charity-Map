import { describe, expect, it } from "vitest";
import { DEMO_PLACES } from "@/lib/db/demo-places";
import { filterPoints, getPlace, listPlaces, toDetail } from "@/lib/db/places";
import { distanceMeters } from "@/lib/privacy/fuzz";
import type { PlaceRecord } from "@/lib/db/types";

const HCMC_BBOX: [number, number, number, number] = [106.3, 10.3, 107.1, 11.2];
const DAY = 86_400_000;

function record(over: Partial<PlaceRecord>): PlaceRecord {
  return {
    id: "t",
    title: "Test",
    description: "",
    category: "ban-ve-so",
    locationType: "fixed",
    locationExact: [106.7, 10.77],
    helpTypes: ["buy_goods"],
    hours: [],
    area: "Quận 1 cũ",
    lastConfirmedAt: new Date().toISOString(),
    sources: [],
    ...over,
  };
}

describe("demo data", () => {
  it("has 30 sample places, each with at least one way to help (principle IV)", () => {
    expect(DEMO_PLACES).toHaveLength(30);
    for (const p of DEMO_PLACES) expect(p.helpTypes.length).toBeGreaterThan(0);
  });

  it("never contains phone or ID numbers", async () => {
    const { hasSensitive } = await import("@/lib/privacy/detect");
    for (const p of DEMO_PLACES) expect(hasSensitive(`${p.title} ${p.description}`)).toBe(false);
  });
});

describe("category filter (US1 scenario 3)", () => {
  it("returns only the chosen categories", async () => {
    const pts = await listPlaces({ bbox: HCMC_BBOX, categories: ["ban-ve-so"] });
    expect(pts.length).toBeGreaterThan(0);
    expect(pts.every((p) => p.category === "ban-ve-so")).toBe(true);
  });

  it("supports several categories at once", async () => {
    const pts = await listPlaces({ bbox: HCMC_BBOX, categories: ["ban-ve-so", "cu-gia-ban-hang"] });
    expect(new Set(pts.map((p) => p.category))).toEqual(new Set(["ban-ve-so", "cu-gia-ban-hang"]));
  });

  it("returns everything visible when no category is chosen", async () => {
    const pts = await listPlaces({ bbox: HCMC_BBOX });
    expect(pts).toHaveLength(29); // 1 điểm mẫu quá 180 ngày bị ẩn
  });

  it("respects the bbox", () => {
    const pts = filterPoints([record({ locationExact: [106.0, 10.0] })], { bbox: HCMC_BBOX });
    expect(pts).toHaveLength(0);
  });
});

describe("location privacy (FR-008, SC-006)", () => {
  it("never exposes the exact location of homeless people", async () => {
    const pts = await listPlaces({ bbox: HCMC_BBOX, categories: ["vo-gia-cu"] });
    expect(pts.length).toBeGreaterThan(0);
    for (const p of pts) {
      const rec = DEMO_PLACES.find((r) => r.id === p.id)!;
      expect(p.approximate).toBe(true);
      expect(distanceMeters(rec.locationExact, p.location)).toBeGreaterThanOrEqual(199);
    }
  });

  it("fuzzes forced-roaming categories even if marked fixed", () => {
    const d = toDetail(record({ category: "vo-gia-cu", locationType: "fixed" }));
    expect(d.approximate).toBe(true);
    expect(d.location).not.toEqual([106.7, 10.77]);
  });

  it("keeps fixed places exact", () => {
    const d = toDetail(record({}));
    expect(d.approximate).toBe(false);
    expect(d.location).toEqual([106.7, 10.77]);
  });

  it("detail response has no exact-location or contact field (FR-014)", async () => {
    const d = await getPlace("mau-20");
    expect(d).not.toBeNull();
    const keys = Object.keys(d!);
    expect(keys).not.toContain("locationExact");
    for (const k of keys) expect(k).not.toMatch(/phone|contact|bank|account|email/i);
  });
});

describe("staleness (FR-010)", () => {
  it("marks 90+ day old places as stale and hides 180+ day old ones", () => {
    const now = new Date();
    const at = (days: number) => new Date(now.getTime() - days * DAY).toISOString();
    const pts = filterPoints(
      [
        record({ id: "fresh", lastConfirmedAt: at(10) }),
        record({ id: "old", lastConfirmedAt: at(100) }),
        record({ id: "gone", lastConfirmedAt: at(200) }),
      ],
      {},
      now,
    );
    expect(pts.map((p) => [p.id, p.stale])).toEqual([
      ["fresh", false],
      ["old", true],
    ]);
  });
});

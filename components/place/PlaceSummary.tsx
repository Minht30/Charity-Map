import type { CSSProperties } from "react";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { HELP_TYPE_LABEL } from "@/lib/help-types";
import { vi } from "@/lib/i18n/vi";
import { formatHours } from "@/lib/format";
import type { PlaceDetail } from "@/lib/db/types";

/** Phần nội dung dùng chung cho thẻ dưới đáy bản đồ và trang chi tiết. */
export function CategoryLabel({ slug }: { slug: PlaceDetail["category"] }) {
  const c = CATEGORY_BY_SLUG[slug];
  return (
    <div className="cat-label">
      <span className="chip-dot" style={{ "--dot": c.color } as CSSProperties} aria-hidden />
      {c.name}
    </div>
  );
}

export function PlaceFacts({ place }: { place: PlaceDetail }) {
  return (
    <>
      {place.approximate && <p className="note">{vi.approximate}</p>}
      {place.stale && <p className="note">{vi.stale}</p>}

      <p className="muted" style={{ margin: "8px 0 0" }}>{vi.howToHelp}:</p>
      <ul className="help-list">
        {place.helpTypes.map((h) => (
          <li key={h}>{HELP_TYPE_LABEL[h]}</li>
        ))}
      </ul>

      {place.hours.length > 0 && (
        <p style={{ margin: "4px 0" }}>
          <span className="muted">{vi.whenThere}: </span>
          {place.hours.map(formatHours).join("; ")}
        </p>
      )}
      <p style={{ margin: "4px 0" }}>
        <span className="muted">{vi.area}: </span>
        {place.area}
      </p>
    </>
  );
}

"use client";

import type { CSSProperties } from "react";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { vi } from "@/lib/i18n/vi";

interface Props {
  selected: CategorySlug[];
  onChange: (next: CategorySlug[]) => void;
}

/** Hàng ô lọc cuộn ngang (plan.md, FR-016). Chạm để bật/tắt, chọn được nhiều loại. */
export default function Filters({ selected, onChange }: Props) {
  const toggle = (slug: CategorySlug) =>
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);

  return (
    <nav className="filters" aria-label={vi.filterLabel}>
      <button type="button" className="chip" aria-pressed={selected.length === 0} onClick={() => onChange([])}>
        {vi.filterAll}
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.slug}
          type="button"
          className="chip"
          aria-pressed={selected.includes(c.slug)}
          onClick={() => toggle(c.slug)}
          title={c.name}
        >
          <span className="chip-dot" style={{ "--dot": c.color } as CSSProperties} aria-hidden />
          {c.short}
        </button>
      ))}
    </nav>
  );
}

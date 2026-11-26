"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Filters from "./Filters";
import { CategoryLabel, PlaceFacts } from "@/components/place/PlaceSummary";
import type { CategorySlug } from "@/lib/categories";
import type { PlaceDetail } from "@/lib/db/types";
import { vi } from "@/lib/i18n/vi";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapScreen({ demo }: { demo: boolean }) {
  const [categories, setCategories] = useState<CategorySlug[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setPlace(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/places/${encodeURIComponent(selectedId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p: PlaceDetail | null) => !cancelled && setPlace(p));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <main className="screen">
      <header className="topbar">
        <h1>{vi.appName}</h1>
        {demo && (
          <span className="badge" title={vi.demoNotice}>
            {vi.demoBadge}
          </span>
        )}
      </header>

      <Filters selected={categories} onChange={setCategories} />

      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
        <MapView categories={categories} onSelect={setSelectedId} onEmptyChange={setEmpty} />

        {empty && !place && (
          <p className="toast" role="status" style={{ top: "auto", bottom: 96 }}>
            {vi.noPlaces}
          </p>
        )}

        {place && (
          <section className="sheet" aria-labelledby="sheet-title">
            <div className="sheet-head">
              <h2 id="sheet-title">{place.title}</h2>
              <button type="button" className="icon-btn" onClick={() => setSelectedId(null)}>
                {vi.close}
              </button>
            </div>
            <CategoryLabel slug={place.category} />
            <PlaceFacts place={place} />
            <Link className="primary-btn" href={`/p/${place.id}`}>
              {vi.seeMore}
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

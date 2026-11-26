"use client";

import { useEffect, useRef, useState } from "react";
import type { ExpressionSpecification, GeoJSONSource, Map as MlMap, MapLayerMouseEvent } from "maplibre-gl";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { vi } from "@/lib/i18n/vi";

/** Trung tâm TP.HCM, dùng khi người dùng không cho lấy vị trí (FR-001). */
export const HCMC_CENTER: [number, number] = [106.6955, 10.7769];
/** Bản đồ nền tạm (miễn phí, không cần khoá) cho tới khi có file PMTiles riêng (T018). */
const DEFAULT_STYLE = "https://tiles.openfreemap.org/styles/positron";

interface Props {
  categories: CategorySlug[];
  onSelect: (id: string | null) => void;
  onEmptyChange?: (empty: boolean) => void;
}

const colorMatch = [
  "match",
  ["get", "category"],
  ...CATEGORIES.flatMap((c) => [c.slug, c.color]),
  "#1b1b18",
] as unknown as ExpressionSpecification;

export default function MapView({ categories, onSelect, onEmptyChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const categoriesRef = useRef(categories);
  const onSelectRef = useRef(onSelect);
  const onEmptyRef = useRef(onEmptyChange);
  const [message, setMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onEmptyRef.current = onEmptyChange;
  });

  async function refresh() {
    const map = mapRef.current;
    if (!map || !map.getSource("places")) return;
    const b = map.getBounds();
    const params = new URLSearchParams({
      bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n) => n.toFixed(5)).join(","),
    });
    if (categoriesRef.current.length) params.set("categories", categoriesRef.current.join(","));
    try {
      const res = await fetch(`/api/places?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      (map.getSource("places") as GeoJSONSource | undefined)?.setData(data);
      onEmptyRef.current?.(data.features.length === 0);
    } catch {
      setMessage(vi.loadError);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let map: MlMap | undefined;

    (async () => {
      const { Map: MapCtor, setWorkerUrl } = await import("maplibre-gl");
      setWorkerUrl("/maplibre/maplibre-gl-worker.mjs"); // xem scripts/copy-maplibre-worker.mjs
      if (cancelled || !containerRef.current) return;

      const m = new MapCtor({
        container: containerRef.current,
        style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_STYLE,
        center: HCMC_CENTER,
        zoom: 13,
        minZoom: 9,
        maxBounds: [
          [105.9, 10.2],
          [107.6, 11.3],
        ],
        attributionControl: { compact: false },
        dragRotate: false,
        pitchWithRotate: false,
      });
      m.touchZoomRotate.disableRotation();
      map = m;
      mapRef.current = m;

      m.on("load", () => {
        m.addSource("places", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterRadius: 44,
          clusterMaxZoom: 15,
        });

        // Cụm điểm: tròn mực, số ở giữa
        m.addLayer({
          id: "clusters",
          type: "circle",
          source: "places",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#1b1b18",
            "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 50, 28],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#fbfaf6",
          },
        });
        m.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "places",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 15,
          },
          paint: { "text-color": "#fbfaf6" },
        });

        // Điểm gần đúng: vùng mờ quanh điểm để không ai hiểu nhầm là vị trí chính xác
        m.addLayer({
          id: "approx-halo",
          type: "circle",
          source: "places",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "approximate"], true]],
          paint: {
            "circle-color": colorMatch,
            "circle-opacity": 0.15,
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 14, 16, 46],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": colorMatch,
            "circle-stroke-opacity": 0.6,
          },
        });

        m.addLayer({
          id: "points",
          type: "circle",
          source: "places",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": colorMatch,
            "circle-radius": 11,
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": ["case", ["==", ["get", "stale"], true], 0.55, 1],
          },
        });

        m.on("click", "clusters", async (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const src = m.getSource("places") as GeoJSONSource;
          const zoom = await src.getClusterExpansionZoom(f.properties.cluster_id);
          m.easeTo({ center: (f.geometry as { coordinates: [number, number] }).coordinates, zoom });
        });
        const selectPoint = (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?.id;
          if (typeof id === "string") onSelectRef.current(id);
        };
        m.on("click", "points", selectPoint);
        m.on("click", "approx-halo", selectPoint);
        m.on("click", (e) => {
          const hits = m.queryRenderedFeatures(e.point, { layers: ["points", "approx-halo", "clusters"] });
          if (hits.length === 0) onSelectRef.current(null);
        });
        for (const layer of ["clusters", "points", "approx-halo"]) {
          m.on("mouseenter", layer, () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", layer, () => (m.getCanvas().style.cursor = ""));
        }

        m.on("moveend", refresh);
        refresh();
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    categoriesRef.current = categories;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  function locate() {
    if (!("geolocation" in navigator)) {
      setMessage(vi.locateDenied);
      return;
    }
    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 });
      },
      () => {
        setLocating(false);
        setMessage(vi.locateDenied);
        mapRef.current?.flyTo({ center: HCMC_CENTER, zoom: 13 });
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map" role="region" aria-label="Bản đồ" />
      {message && (
        <button type="button" className="toast" role="status" onClick={() => setMessage(null)}>
          {message}
        </button>
      )}
      <button type="button" className="float-btn" onClick={locate} disabled={locating}>
        {locating ? vi.locating : vi.locateMe}
      </button>
    </div>
  );
}

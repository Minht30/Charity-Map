import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryLabel, PlaceFacts } from "@/components/place/PlaceSummary";
import { getPlace } from "@/lib/db/places";
import { directionsUrl } from "@/lib/format";
import { vi } from "@/lib/i18n/vi";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const place = await getPlace((await params).id);
  return { title: place ? `${place.title} · ${vi.appName}` : vi.appName };
}

export default async function PlacePage({ params }: Params) {
  const place = await getPlace((await params).id);
  if (!place) notFound();

  return (
    <main className="page">
      <Link className="back-link" href="/">
        ← {vi.back}
      </Link>
      <h1>{place.title}</h1>
      <CategoryLabel slug={place.category} />
      {place.description && <p>{place.description}</p>}
      <PlaceFacts place={place} />

      {/* Điểm gần đúng không có nút chỉ đường: chỉ đường tới một chỗ đã làm mờ sẽ đưa người ta tới sai chỗ. */}
      {!place.approximate && (
        <a className="primary-btn" href={directionsUrl(place.location)} target="_blank" rel="noopener noreferrer">
          {vi.directions}
        </a>
      )}
      <Link className="secondary-btn" href="/">
        {vi.back}
      </Link>

      <hr className="rule" />
      <p className="muted">{vi.noMoneyNote}</p>
    </main>
  );
}

import Link from "next/link";
import { vi } from "@/lib/i18n/vi";

export default function NotFound() {
  return (
    <main className="page">
      <h1>{vi.notFound}</h1>
      <Link className="primary-btn" href="/">
        {vi.back}
      </Link>
    </main>
  );
}

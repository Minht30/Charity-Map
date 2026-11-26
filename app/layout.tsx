import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const body = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bản đồ thiện nguyện",
  description: "Những hoàn cảnh cần giúp quanh bạn ở TP.HCM, và cách giúp không chỉ bằng tiền.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfaf6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={body.variable}>
      <body>{children}</body>
    </html>
  );
}

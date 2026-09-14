import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "こむぎの旅 — 小さな旅を、見守ろう。",
  description:
    "福岡を気ままに旅するこむぎ。現在地と届いた便りを、そっと見守るアプリ。",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

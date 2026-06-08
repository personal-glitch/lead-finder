import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KundenRadar – Neukunden finden & anrufen",
  description:
    "Passende B2B-Firmen in deinem Umkreis finden, Kontakte anreichern und in der Pipeline bearbeiten – für jeden Dienstleister.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

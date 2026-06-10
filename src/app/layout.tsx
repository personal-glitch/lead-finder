import type { Metadata } from "next";
import { config } from "@/lib/config";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const TITLE = "KundenRadar – Neukunden finden & anrufen";
const DESCRIPTION =
  "Passende B2B-Firmen in deinem Umkreis finden, Kontakte anreichern und in der Pipeline bearbeiten – für jeden Dienstleister.";

export const metadata: Metadata = {
  metadataBase: new URL(config.appUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "KundenRadar",
  robots: { index: true, follow: true },
  verification: { google: "_beC31t_DXMtwOG1ejHcukNusu6YI_uYciq6Ax-sUnE" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "KundenRadar",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}<Analytics /></body>
    </html>
  );
}

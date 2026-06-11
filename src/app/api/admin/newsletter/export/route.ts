import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { listSubscribers } from "@/lib/newsletter";

// CSV-Export der Newsletter-Abonnenten – NUR für die Superadmin-E-Mail.
export async function GET() {
  try {
    if (!config.supabase.enabled) {
      throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    }
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const subs = await listSubscribers();
    const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["email", "status", "quelle", "angemeldet_am", "bestaetigt_am", "abgemeldet_am"].join(","),
    ];
    for (const s of subs) {
      rows.push(
        [s.email, s.status, s.source ?? "", s.consentAt, s.confirmedAt ?? "", s.unsubscribedAt ?? ""]
          .map((v) => esc(String(v)))
          .join(","),
      );
    }
    const csv = "﻿" + rows.join("\r\n"); // BOM, damit Excel Umlaute korrekt zeigt
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="newsletter-abonnenten.csv"',
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}

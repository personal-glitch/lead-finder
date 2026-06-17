import { jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { listCompaniesAdmin } from "@/lib/catalog";

async function requireAdmin() {
  if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
  const { createClient } = await import("@/lib/supabase/server");
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");
}

function csvCell(v: string | null | undefined): string {
  const s = (v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

// CSV-Export ALLER Katalog-Einträge (inkl. E-Mail) – nur Superadmin.
export async function GET() {
  try {
    await requireAdmin();
    const companies = await listCompaniesAdmin();
    const header = ["Firma", "E-Mail", "Telefon", "Branche", "PLZ", "Ort", "Status", "Newsletter", "Eingetragen"];
    const rows = companies.map((c) =>
      [
        c.name,
        c.contactEmail,
        c.contactPhone ?? "",
        c.category,
        c.plz ?? "",
        c.ort ?? "",
        c.status,
        c.subscriber ?? "—",
        new Date(c.createdAt).toLocaleDateString("de-DE"),
      ].map(csvCell).join(","),
    );
    const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="katalog-firmen-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}

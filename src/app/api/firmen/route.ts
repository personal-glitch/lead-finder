import { z } from "zod";
import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { createCompany, listPublicCompanies } from "@/lib/catalog";

// Öffentliche, kostenlose Firmen-Registrierung (Formular auf /firma-eintragen).
const CreateBody = z.object({
  name: z.string().min(2).max(140),
  category: z.string().min(1),
  street: z.string().max(160).optional(),
  plz: z.string().max(10).optional(),
  ort: z.string().max(120).optional(),
  openingHours: z.string().max(400).optional(),
  description: z.string().max(2000).optional(),
  website: z.string().max(200).optional(),
  contactName: z.string().max(120).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  consent: z.boolean(),
  newsletter: z.boolean().optional(),
  website_hp: z.string().optional(), // Honeypot
});

export async function POST(req: NextRequest) {
  try {
    const b = CreateBody.parse(await req.json());
    if (b.website_hp) return jsonOk({ ok: true }); // Bot
    if (!b.consent) throw new AppError("bad_request", "Bitte stimme der Verarbeitung zu.");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    const res = await createCompany({
      name: b.name,
      category: b.category,
      street: b.street ?? null,
      plz: b.plz ?? null,
      ort: b.ort ?? null,
      openingHours: b.openingHours ?? null,
      description: b.description ?? null,
      website: b.website ?? null,
      contactName: b.contactName ?? null,
      contactEmail: b.contactEmail,
      contactPhone: b.contactPhone ?? null,
      newsletter: b.newsletter ?? false,
      ip,
    });
    if (!res.ok) throw new AppError("bad_request", res.error);
    return jsonOk({ ok: true, slug: res.slug });
  } catch (err) {
    return jsonError(err);
  }
}

// Öffentliche Liste freigeschalteter Firmen (für das Verzeichnis / Filter).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companies = await listPublicCompanies({
      category: searchParams.get("category"),
      ort: searchParams.get("ort"),
      q: searchParams.get("q"),
      limit: 300,
    });
    return jsonOk({ companies });
  } catch (err) {
    return jsonError(err);
  }
}

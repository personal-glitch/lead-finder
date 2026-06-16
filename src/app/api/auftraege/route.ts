import { z } from "zod";
import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getOwnerId } from "@/lib/db";
import { createServiceRequest, listOpenRequests } from "@/lib/marketplace";

// Öffentliches Anlegen einer Anfrage (Formular auf /auftrag-einstellen).
const CreateBody = z.object({
  category: z.string().min(1),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(4000),
  plz: z.string().max(10).optional(),
  ort: z.string().max(120).optional(),
  customerType: z.enum(["privat", "gewerblich"]),
  budget: z.string().max(80).optional(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  consent: z.boolean(),
  website: z.string().optional(), // Honeypot
});

export async function POST(req: NextRequest) {
  try {
    const b = CreateBody.parse(await req.json());
    if (b.website) return jsonOk({ ok: true }); // Bot
    if (!b.consent) throw new AppError("bad_request", "Bitte stimme der Verarbeitung zu.");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    const res = await createServiceRequest({
      category: b.category,
      title: b.title,
      description: b.description,
      plz: b.plz ?? null,
      ort: b.ort ?? null,
      customerType: b.customerType,
      budget: b.budget ?? null,
      name: b.name,
      email: b.email,
      phone: b.phone ?? null,
      ip,
    });
    if (!res.ok) throw new AppError("bad_request", res.error);
    return jsonOk({ ok: true, id: res.id });
  } catch (err) {
    return jsonError(err);
  }
}

// Liste offener Anfragen für die In-Tool-Inbox (nur eingeloggte Nutzer).
export async function GET(req: NextRequest) {
  try {
    const ownerId = await getOwnerId();
    const { searchParams } = new URL(req.url);
    const requests = await listOpenRequests(ownerId, {
      category: searchParams.get("category"),
      q: searchParams.get("q"),
    });
    return jsonOk({ requests });
  } catch (err) {
    return jsonError(err);
  }
}

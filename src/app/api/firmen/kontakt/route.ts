import { z } from "zod";
import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { createCompanyContact } from "@/lib/catalog";

// Kontaktanfrage an eine gelistete Firma – läuft über uns (Lead-Capture).
const Body = z.object({
  slug: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().min(5).max(4000),
  consent: z.boolean(),
  website_hp: z.string().optional(), // Honeypot
});

export async function POST(req: NextRequest) {
  try {
    const b = Body.parse(await req.json());
    if (b.website_hp) return jsonOk({ ok: true }); // Bot
    if (!b.consent) throw new AppError("bad_request", "Bitte stimme der Verarbeitung zu.");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    const res = await createCompanyContact({
      slug: b.slug,
      name: b.name,
      email: b.email,
      phone: b.phone ?? null,
      message: b.message,
      ip,
    });
    if (!res.ok) throw new AppError("bad_request", res.error);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}

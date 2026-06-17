import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { listCompaniesAdmin, setCompanyStatus, type CompanyStatus } from "@/lib/catalog";

async function requireAdmin() {
  if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
  const { createClient } = await import("@/lib/supabase/server");
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");
}

// Liste der Katalog-Einträge (optional nach Status gefiltert) – nur Superadmin.
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status") as CompanyStatus | null;
    const companies = await listCompaniesAdmin(status ?? undefined);
    return jsonOk({ companies });
  } catch (err) {
    return jsonError(err);
  }
}

// Status setzen (freigeben / ablehnen) – nur Superadmin.
const Body = z.object({ id: z.string().min(1), status: z.enum(["pending", "active", "rejected"]) });

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { id, status } = Body.parse(await req.json());
    const res = await setCompanyStatus(id, status);
    if (!res.ok) throw new AppError("bad_request", res.error);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}

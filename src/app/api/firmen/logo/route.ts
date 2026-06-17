import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_BYTES = 1_500_000; // 1,5 MB
const BUCKET = "company-logos";

// Öffentlicher Logo-Upload (vor der Registrierung). Liefert die öffentliche URL,
// die dann beim Eintrag gespeichert wird. Sichtbar wird das Logo erst nach Freigabe
// (öffentliche Ansichten zeigen nur aktive Firmen).
export async function POST(req: NextRequest) {
  try {
    if (!config.supabase.enabled || !config.supabase.serviceRoleKey) {
      throw new AppError("not_configured", "Upload ist nicht konfiguriert.");
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("bad_request", "Keine Datei erhalten.");

    const ext = ALLOWED[file.type];
    if (!ext) throw new AppError("bad_request", "Nur PNG, JPG oder WebP erlaubt.");
    if (file.size > MAX_BYTES) throw new AppError("bad_request", "Datei zu groß (max. 1,5 MB).");

    const buf = Buffer.from(await file.arrayBuffer());
    const { createAdminClient } = await import("@/lib/supabase/server");
    const sb = createAdminClient();
    const path = `${randomUUID()}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new AppError("bad_request", "Upload fehlgeschlagen.");

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return jsonOk({ ok: true, url: data.publicUrl });
  } catch (err) {
    return jsonError(err);
  }
}

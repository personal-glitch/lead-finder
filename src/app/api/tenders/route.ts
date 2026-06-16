import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { getOwnerId } from "@/lib/db";
import { ensureRecentImport, listTenders } from "@/lib/tenders";

// Öffentliche Ausschreibungen für die In-Tool-Anzeige (nur eingeloggte Nutzer).
export async function GET(req: NextRequest) {
  try {
    await getOwnerId(); // erzwingt Login (401 sonst)
    await ensureRecentImport(); // hält die letzten Tage frisch (idempotent, beschränkt)
    const { searchParams } = new URL(req.url);
    const tenders = await listTenders({
      category: searchParams.get("category"),
      q: searchParams.get("q"),
    });
    return jsonOk({ tenders });
  } catch (err) {
    return jsonError(err);
  }
}

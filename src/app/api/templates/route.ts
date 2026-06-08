import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId, ensureSeeded } from "@/lib/db";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    await ensureSeeded(ownerId);
    const templates = await getStore().listTemplates(ownerId);
    return jsonOk({ templates });
  } catch (err) {
    return jsonError(err);
  }
}

const Body = z.object({
  name: z.string().min(1, "Name erforderlich."),
  subject: z.string().min(1, "Betreff erforderlich."),
  body: z.string().min(1, "Inhalt erforderlich."),
});

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const t = Body.parse(await req.json());
    const template = await getStore().createTemplate(ownerId, t);
    return jsonOk({ template }, 201);
  } catch (err) {
    return jsonError(err);
  }
}

import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    const suppressions = await getStore().listSuppressions(ownerId);
    return jsonOk({ suppressions });
  } catch (err) {
    return jsonError(err);
  }
}

const Body = z.object({
  email: z.email("Ungültige E-Mail-Adresse."),
  reason: z.string().nullish(),
});

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { email, reason } = Body.parse(await req.json());
    const suppression = await getStore().addSuppression(
      ownerId,
      email,
      reason ?? "manuell",
    );
    return jsonOk({ suppression }, 201);
  } catch (err) {
    return jsonError(err);
  }
}

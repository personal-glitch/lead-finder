import { jsonOk, jsonError } from "@/lib/api";
import { getOwnerId } from "@/lib/db";
import { sendTestEmail } from "@/lib/email/send";

// Sendet eine Test-Mail an die eigene Absenderadresse (prüft den SMTP-Zugang).
export async function POST() {
  try {
    const ownerId = await getOwnerId();
    const result = await sendTestEmail(ownerId);
    return jsonOk(result);
  } catch (err) {
    return jsonError(err);
  }
}

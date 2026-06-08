// Hilfsfunktionen für API-Routen: einheitliche JSON-Antworten & Fehlerformat.
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    const message =
      err.issues.map((i) => i.message).join("; ") || "Ungültige Eingabe.";
    return NextResponse.json(
      { error: { code: "bad_request", message } },
      { status: 400 },
    );
  }
  const message = err instanceof Error ? err.message : "Interner Fehler.";
  // Serverseitig protokollieren – hilft beim Debuggen externer Calls.
  console.error("[api] unhandled error:", err);
  return NextResponse.json(
    { error: { code: "internal", message } },
    { status: 500 },
  );
}

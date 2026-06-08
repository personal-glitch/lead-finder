// Session-Refresh + Routen-Schutz für die Middleware.
// Ohne gesetzte Supabase-Env-Variablen passiert nichts (lokaler Modus = keine Auth).
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Öffentlich erreichbar – ohne Anmeldung. Alles andere wird geschützt.
const PUBLIC_PREFIXES = [
  "/login",
  "/registrieren",
  "/auth",
  "/impressum",
  "/datenschutz",
  "/kontakt",
  "/abmelden",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  // API-Routen sichern sich selbst ab (JSON-401 statt Redirect).
  if (pathname.startsWith("/api")) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  // Lokaler Modus (keine Keys): keinerlei Auth, App bleibt frei zugänglich.
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // WICHTIG: getUser() validiert das Token serverseitig und frischt es auf.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Nicht angemeldet + geschützte Seite → zur Anmeldung (mit Rücksprungziel).
  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Bereits angemeldet + Login/Registrieren aufgerufen → direkt ins Tool.
  if (user && (pathname === "/login" || pathname === "/registrieren")) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/dashboard";
    appUrl.search = "";
    return NextResponse.redirect(appUrl);
  }

  return response;
}

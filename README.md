# Lead-Finder – Vertriebs-Pipeline für Reinigungsfirmen

Ein Vertriebs-Tool, mit dem eine Reinigungsfirma **ohne eigenen Vertrieb** in drei Schritten Neukunden gewinnt:

1. **Finden** – per Geo-Suche (OpenStreetMap) Objekte/Firmen im PLZ-Umkreis aufspüren, wo Reinigung gebraucht wird (Büros, Praxen, Sporthallen, Hotels, Schulen, Gastro …).
2. **Anreichern** – zu jedem Treffer aus dem **Impressum** eine anrufbare Telefonnummer, E-Mail und – wenn möglich – einen Ansprechpartner ermitteln.
3. **Bearbeiten** – Treffer per **Drag & Drop** in eine Pipeline ziehen und per **E-Mail-Vorlagen** ansprechen.

> Der Wert des Tools steht und fällt mit der **Datenqualität der Kontakte**, nicht mit der Anzahl der Pins. Echte Telefonnummern und Ansprechpartner werden über Masse priorisiert.

---

## Schnellstart (läuft ohne jegliche Keys)

```bash
npm install
npm run dev          # http://localhost:3000
```

Ohne Konfiguration nutzt die App einen **lokalen Datei-Store** (`.data/store.json`) – damit
bleibt der Pipeline-Stand über Reloads erhalten. OSM-Suche, Impressum-Anreicherung und der
Telefon-Parser funktionieren sofort. Persistenz/Auth (Supabase) und E-Mail-Versand (Resend)
schalten sich automatisch frei, sobald die jeweiligen Variablen gesetzt sind (Feature-Flags).

| Skript | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Production-Build / -Server |
| `npm test` | Unit-Tests (Telefon-Parser, Impressum-Heuristiken, OSM-Mapping, Templates) |
| `npm run typecheck` | TypeScript ohne Emit |

---

## Tech-Stack

- **Next.js 16** (App Router) – alle externen Calls (OSM, Scraping) laufen ausschließlich
  server-seitig in Route-Handlern (Rate-Limits, User-Agent-Pflicht, CORS).
- **TypeScript**, **Tailwind CSS v4**, **@dnd-kit** (Drag & Drop), **zod** (Validierung), **cheerio** (HTML-Parsing).
- **Supabase** (Postgres + RLS) – optional, Migration unter `supabase/migrations/`.
- **Resend** – optional, für den E-Mail-Versand.

---

## Konfiguration (`.env.local`)

`.env.example` nach `.env.local` kopieren und ausfüllen. Alles außer `OSM_USER_AGENT` ist optional.

| Variable | Pflicht? | Wirkung |
|---|---|---|
| `OSM_USER_AGENT` | empfohlen | Aussagekräftiger User-Agent **mit Kontakt** für Nominatim/Overpass. Ohne droht eine Sperre. |
| `NEXT_PUBLIC_APP_URL` | – | Basis-URL für Abmelde-Links in E-Mails. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | – | Aktiviert Postgres + RLS statt Datei-Store. |
| `RESEND_API_KEY`, `RESEND_FROM` | – | Aktiviert echten E-Mail-Versand. |
| `SENDER_IMPRESSUM` | bei Versand | Pflicht-Footer (Impressum) in jeder Werbe-E-Mail. |

### ⚠️ OSM-Etikette (wichtig)

[Nominatim](https://operations.osmfoundation.org/policies/nominatim/) verlangt: **eigener User-Agent
mit Kontakt**, **max. 1 Request/Sekunde**, Ergebnisse cachen. Beides ist hier umgesetzt
(`src/lib/rate-limit.ts`, Cache im `geocode`). Overpass ist ebenfalls rate-limited; Anfragen werden
serialisiert, Fehler (429/504/Timeout) werden abgefangen und dem Nutzer verständlich gemeldet.

> Nominatim **blockt Rechenzentrums-IPs** (Cloud/CI) häufig mit `HTTP 403`. Lokal oder auf einem
> normalen Server funktioniert die Suche; in einer Sandbox kann sie 403 liefern. Bei Bedarf einen
> eigenen Nominatim/Overpass-Mirror über `NOMINATIM_URL` / `OVERPASS_URL` hinterlegen.

### Supabase aktivieren

1. Projekt anlegen, Keys in `.env.local` setzen.
2. Migration einspielen: `supabase/migrations/0001_init.sql` (z. B. via Supabase CLI oder SQL-Editor).
3. Neu starten – die App nutzt jetzt Postgres mit Row Level Security (Multi-Tenant über `owner_id`).

> Hinweis: Eine echte Login-/Auth-Anbindung ist im Skelett noch nicht verdrahtet – `owner_id`
> ist eine Platzhalter-UUID (`getOwnerId()` in `src/lib/db/index.ts`). Mit Supabase-Auth dort
> `auth.uid()` zurückgeben.

---

## Features im Detail

### 1. Geo-Suche (`findLeadsOSM`) — `src/lib/osm/`
PLZ/Ort → Geocoding (Nominatim) → Overpass-Query aus auswählbaren **Objekttyp-Presets**
(`presets.ts`) → `out center tags;` (Mittelpunkt auch für Flächen) → Mapping auf Leads inkl.
Dedupe. Hausverwaltungen sind in OSM dünn getaggt; das ist in `presets.ts` vermerkt – als
spätere Zusatzquelle gedacht, **nicht** in dieser Iteration.

### 2. Impressum-Anreicherung (`enrichLeadFromWebsite`) — `src/lib/enrich/`
Startseite laden → Impressum/Kontakt-Link finden → Seite parsen: Telefon (über den Parser),
E-Mail (`mailto:` bevorzugt) und Ansprechpartner (Heuristik „Geschäftsführer/Inhaber/Vertreten
durch/Ansprechpartner"). Höflich: robots.txt-Respekt, Verzögerung pro Domain, Timeouts,
Größenlimit. Fehlende Daten werden als `null` gespeichert, der Lead bleibt erhalten.

### 3. Telefon-Parser (deutsch) — `src/lib/phone/parse-de.ts`
Erkennt **nur echte** Rufnummern. Strategie: **erst** Kontext maskieren
(HRB/HRA, Steuernummer, USt-IdNr/`DE\d{9}`, IBAN, Datum, PLZ), **dann** Telefon-Regex anwenden,
**dann** normalisieren + E.164 ableiten. Unterscheidet zudem Tel/Mobil/Fax. Vollständig
unit-getestet (siehe `parse-de.test.ts`).

### 4. Agenten — `src/app/(app)/agenten`, `src/components/agents`
Benannte, wiederverwendbare Lead-Gen-Profile mit eigenem Avatar (Linien-Icon + Farbe,
kein Emoji). Anlegen über einen Dialog mit Schnellstart-Vorlagen; jeder Agent speichert
Objekttypen, Suchbegriffe, PLZ/Umkreis/Branche. „Jetzt suchen" lässt `findLeadsOSM` mit dem
Profil laufen, zeigt die Treffer und übernimmt ausgewählte per Klick in die Pipeline.
Lauf-Statistik (Treffer, angelegte Leads) pro Agent.

### 5. Pipeline (Kanban) — `src/app/(app)/pipeline`, `src/components/Pipeline.tsx`
Konfigurierbare Stages (Neu → Kontaktiert → Interessiert → Angebot → Kunde → Verloren),
Kennzahlen-Karten mit Fokus auf Datenqualität (mit Telefon / mit Ansprechpartner).
Leads per Drag & Drop zwischen Stages ziehen (@dnd-kit), Stand sofort persistiert. Duplikate
über Website bzw. Name+Adresse verhindert. Lead-Detail (Drawer) mit Notizen & Aktivitäts-Historie.

### 6. E-Mail-Outreach — `src/lib/email/`, `LeadDetailDrawer`, Vorlagen-Seite
Vorlagen mit Platzhaltern `{{firma}}`, `{{ansprechpartner}}`, `{{ort}}`, `{{objekttyp}}`.
Versand über Resend, pro Lead. **Rechtlich:** jede E-Mail enthält Impressum + funktionierenden
Abmelde-/Opt-out-Link (`/abmelden`), Opt-outs landen in der **Suppressions**-Tabelle und werden
**vor jedem Versand** geprüft. Die `source` jedes Leads wird gespeichert (`osm`/`impressum`/`manual`),
damit Auskunfts-/Löschanfragen (DSGVO) beantwortbar sind.

---

## Datenmodell

`leads`, `pipeline_stages`, `email_templates`, `email_log`, `suppressions` – siehe
`supabase/migrations/0001_init.sql`. RLS so, dass jeder Nutzer nur eigene Daten sieht
(Multi-Tenant von Anfang an).

---

## Projektstruktur

```
src/
  app/
    (app)/             # App-Shell (Sidebar) – geschützter Bereich
      pipeline/        #   Kanban + Kennzahlen
      agenten/         #   Agenten-Grid + Detail/Lauf  (/agenten, /agenten/[id])
      vorlagen/        #   E-Mail-Vorlagen + Opt-out-Liste
    abmelden/          #   Ein-Klick-Abmeldelink (ohne Shell)
    api/agents…        #   CRUD + /run (findLeadsOSM mit Agent-Profil)
    api/leads…         #   Suche, Anreicherung, CRUD, Stage/Notizen
    api/stages, templates, email, suppressions
  lib/
    osm/               # geocode (+ Photon-Fallback), overpass (+ Mirror), presets, find-leads
    enrich/            # impressum, robots
    phone/             # parse-de (+ Tests)
    db/                # DataStore: local (Datei) | supabase, Migrationen
    email/             # templates, send
    agent-templates, config, errors, rate-limit, dedupe, api, client
  components/
    shell/AppShell     # Sidebar + Seitenkopf + FeatureFlags-Context
    agents/AgentDialog # "Neuer Agent" (Vorlagen, Icon+Farbe-Avatar, Felder)
    Pipeline, LeadDetailDrawer, icons (Linien-Icons + Avatar), ui (Design-System)
```

---

## Tests

`npm test` – 42 Tests, u. a.:
- die vier akzeptierten DE-Telefonformate werden erkannt; HRB/Steuer/USt/IBAN/Datum/PLZ verworfen,
- Impressum-Heuristiken (Link-Findung, Ansprechpartner, E-Mail),
- Overpass-Query-Bau und OSM-Element → Lead-Mapping,
- Platzhalter-Ersetzung der E-Mail-Vorlagen.

---

## Bewusst NICHT in dieser Iteration

- Zusätzliche Datenquellen neben OSM/Impressum (später, falls Hausverwaltungs-Abdeckung zu dünn).
- KI-gestütztes Schreiben der E-Mails (erst manuelle Vorlagen).
- Telefon-Wählfunktion / Dialer.
- Echte Login-/Auth-Anbindung (Supabase-Auth) – `owner_id` ist aktuell Platzhalter.

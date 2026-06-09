"use client";
import { PageHeader } from "@/components/shell/AppShell";
import { Kalkulator } from "@/components/Kalkulator";

export default function KalkulatorPage() {
  return (
    <>
      <PageHeader
        title="Kalkulator"
        subtitle="Preise & Stundensätze für Gebäudereinigung, Handwerk und Dienstleistung – in Sekunden"
      />
      <div className="p-4 sm:p-7">
        <Kalkulator />
      </div>
    </>
  );
}

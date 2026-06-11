import type { Metadata } from "next";
import { LegalShell, H2, P } from "@/components/landing/LegalShell";
import { ContactForm } from "@/components/landing/ContactForm";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Kontakt – KundenRadar" };

export default function KontaktPage() {
  return (
    <LegalShell title="Kontakt" intro="Fragen, Feedback oder Interesse an KundenRadar? Schreib uns – wir antworten zügig.">
      <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <H2>So erreichst du uns</H2>
          <div className="space-y-2 text-sm text-[var(--color-muted)]">
            <p className="flex items-center gap-2"><Icon name="mail" size={15} /> kontakt@seciora-solutions.de</p>
            <p className="flex items-center gap-2"><Icon name="phone" size={15} /> +49 1529 2627062</p>
            <p className="flex items-center gap-2">
              <Icon name="mail" size={15} />
              <a href="https://wa.me/4915292627062?text=Hallo%2C%20ich%20interessiere%20mich%20f%C3%BCr%20KundenRadar." target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-ink)]">WhatsApp: +49 1529 2627062</a>
            </p>
            <p className="flex items-center gap-2"><Icon name="pin" size={15} /> Charlottenstraße 37, 51149 Köln</p>
          </div>
          <P>Anbieter: Seciora Solutions, Inhaber Cihan Yildirim. Mo–Fr, 9–17 Uhr. Für rechtliche Angaben siehe <a href="/impressum" className="text-[var(--color-brand)] hover:underline">Impressum</a>.</P>
        </div>
        <ContactForm />
      </div>
    </LegalShell>
  );
}

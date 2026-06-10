import type { Metadata } from "next";
import { LegalShell, H2, P, UL } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "Widerrufsbelehrung – KundenRadar" };

export default function WiderrufPage() {
  return (
    <LegalShell title="Widerrufsbelehrung">
      <H2>Anwendungsbereich</H2>
      <P>
        Das gesetzliche Widerrufsrecht steht ausschließlich Verbraucherinnen und Verbrauchern (§ 13 BGB) zu.
        Unternehmerinnen und Unternehmern (§ 14 BGB) steht ein gesetzliches Widerrufsrecht nicht zu. Da sich
        „KundenRadar" an Unternehmer richtet, gilt die nachfolgende Belehrung nur, soweit im Einzelfall ausnahmsweise
        ein Verbraucher Vertragspartner wird.
      </P>

      <H2>Widerrufsrecht</H2>
      <P>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
        Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
      </P>
      <P>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Seciora Solutions, Inhaber Cihan Yildirim,
        Windthorststraße 15, 51373 Leverkusen, E-Mail: kontakt@seciora-solutions.de, Telefon: +49 15566 021171) mittels einer
        eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen
        Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das
        jedoch nicht vorgeschrieben ist.
      </P>
      <P>
        Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts
        vor Ablauf der Widerrufsfrist absenden.
      </P>

      <H2>Folgen des Widerrufs</H2>
      <P>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
        unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren
        Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel,
        das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas
        anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
      </P>

      <H2>Vorzeitiges Erlöschen des Widerrufsrechts</H2>
      <P>
        Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen
        angemessenen Betrag zu zahlen, der dem Anteil der bis zum Zeitpunkt des Widerrufs bereits erbrachten
        Dienstleistungen entspricht. Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von
        Dienstleistungen vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung erst
        begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon
        bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung verlieren.
      </P>

      <H2>Muster-Widerrufsformular</H2>
      <P>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden es zurück.)</P>
      <UL items={[
        "An: Seciora Solutions, Inhaber Cihan Yildirim, Windthorststraße 15, 51373 Leverkusen, E-Mail: kontakt@seciora-solutions.de",
        "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung: Nutzung von KundenRadar",
        "Bestellt am (*) / erhalten am (*): ____________________",
        "Name des/der Verbraucher(s): ____________________",
        "Anschrift des/der Verbraucher(s): ____________________",
        "Datum und Unterschrift (nur bei Mitteilung auf Papier): ____________________",
        "(*) Unzutreffendes streichen.",
      ]} />
    </LegalShell>
  );
}

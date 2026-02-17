import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AGB – findius.io',
  description: 'Allgemeine Geschäftsbedingungen von findius.io',
};

export default function AGBPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-white">
        Allgemeine Geschäftsbedingungen
      </h1>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <p className="text-zinc-500 dark:text-zinc-400">Stand: Februar 2025</p>

        <section>
          <h2 className="text-xl font-semibold">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform findius.io
            (nachfolgend &quot;Plattform&quot;). Mit der Registrierung und Nutzung der Plattform erklärt sich
            der Nutzer mit diesen AGB einverstanden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Leistungsbeschreibung</h2>
          <p>
            findius.io ist eine Vergleichsplattform, die Nutzern dabei hilft, Produkte und Dienstleistungen
            zu vergleichen. Die Plattform stellt Informationen, Vergleiche und Bewertungen bereit. Die
            dargestellten Inhalte dienen ausschließlich der Information und stellen keine Kaufberatung oder
            Empfehlung dar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Nutzerkonto</h2>
          <p>
            Für bestimmte Funktionen (Kommentare, Bewertungen) ist eine Registrierung erforderlich. Die
            Anmeldung erfolgt per E-Mail-Adresse und Magic Link. Bei der Registrierung wählt der Nutzer
            einen eindeutigen Nutzernamen (5–15 Zeichen, bestehend aus Buchstaben, Zahlen und Unterstrichen).
          </p>
          <p>
            Der Nutzer ist verantwortlich für die Sicherheit seines Kontos und die Angabe einer gültigen
            E-Mail-Adresse. Ein Nutzername darf keine beleidigenden, irreführenden oder rechtswidrigen
            Inhalte enthalten.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Inhalte und Kommentare</h2>
          <p>
            Nutzer können Kommentare und Bewertungen auf der Plattform hinterlassen. Dabei verpflichtet
            sich der Nutzer:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Keine rechtswidrigen, beleidigenden oder diskriminierenden Inhalte zu veröffentlichen</li>
            <li>Keine Spam- oder Werbeinhalte zu verbreiten</li>
            <li>Keine Urheberrechte Dritter zu verletzen</li>
            <li>Sachlich und respektvoll zu kommentieren</li>
          </ul>
          <p>
            findius.io behält sich das Recht vor, Inhalte ohne Angabe von Gründen zu entfernen und
            Nutzerkonten bei Verstoß gegen diese AGB zu sperren.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Affiliate-Links und Monetarisierung</h2>
          <p>
            findius.io kann Affiliate-Links zu externen Anbietern enthalten. Beim Kauf über diese Links
            erhält findius.io eine Provision. Dies hat keinen Einfluss auf den Preis für den Nutzer.
            Affiliate-Links werden als solche gekennzeichnet.
          </p>
          <p>
            Die Plattform übernimmt keine Haftung für Produkte oder Dienstleistungen, die über
            Affiliate-Links erworben werden. Vertragliche Beziehungen bestehen ausschließlich zwischen
            dem Nutzer und dem jeweiligen Anbieter.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Haftungsausschluss</h2>
          <p>
            Die Inhalte auf findius.io werden mit größtmöglicher Sorgfalt erstellt. Dennoch übernimmt
            findius.io keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten
            Informationen. Die Nutzung der Plattform erfolgt auf eigene Verantwortung des Nutzers.
          </p>
          <p>
            findius.io haftet nicht für Schäden, die durch die Nutzung der Plattform oder der verlinkten
            externen Inhalte entstehen, sofern nicht Vorsatz oder grobe Fahrlässigkeit vorliegt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Änderungen der AGB</h2>
          <p>
            findius.io behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden auf der Plattform
            veröffentlicht. Die fortgesetzte Nutzung der Plattform nach Veröffentlichung der Änderungen
            gilt als Zustimmung zu den geänderten AGB.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Anwendbares Recht</h2>
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich
            zulässig, der Sitz des Betreibers.
          </p>
        </section>
      </div>
    </div>
  );
}

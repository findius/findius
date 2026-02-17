import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung – findius.io',
  description: 'Datenschutzerklärung von findius.io',
};

export default function DatenschutzPage() {
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
        Datenschutzerklärung
      </h1>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <p className="text-zinc-500 dark:text-zinc-400">Stand: Februar 2025</p>

        <section>
          <h2 className="text-xl font-semibold">1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Plattform ist der Betreiber von findius.io.
            Bei Fragen zum Datenschutz kannst du uns über die auf der Plattform angegebenen Kontaktmöglichkeiten erreichen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Erhobene Daten</h2>
          <p>Bei der Nutzung von findius.io werden folgende Daten erhoben:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Bei der Registrierung:</strong> E-Mail-Adresse, selbstgewählter Nutzername</li>
            <li><strong>Bei der Nutzung:</strong> Kommentare, Bewertungen, Seitenaufrufe</li>
            <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Betriebssystem, Zugriffszeiten (durch Webserver-Logs und Analytics)</li>
            <li><strong>Cookies:</strong> Authentifizierungs-Cookies für die Sitzungsverwaltung</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Zweck der Datenverarbeitung</h2>
          <p>Die erhobenen Daten werden verwendet für:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Bereitstellung und Betrieb der Plattform</li>
            <li>Authentifizierung und Kontoverwaltung (Magic Link per E-Mail)</li>
            <li>Anzeige von Nutzernamen bei Kommentaren und Bewertungen</li>
            <li>Verbesserung der Plattform durch anonymisierte Nutzungsanalysen</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Datenverarbeiter und Dienste</h2>
          <p>Für den Betrieb der Plattform setzen wir folgende Drittanbieter ein:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase (Supabase Inc.):</strong> Datenbank und Authentifizierung. Supabase speichert
              Nutzerdaten (E-Mail, Profil) und Inhalte (Kommentare, Bewertungen). Weitere Informationen:
              <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer"> supabase.com/privacy</a>
            </li>
            <li>
              <strong>Vercel (Vercel Inc.):</strong> Hosting und Bereitstellung der Plattform. Vercel
              verarbeitet technische Zugriffsdaten. Weitere Informationen:
              <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer"> vercel.com/legal/privacy-policy</a>
            </li>
            <li>
              <strong>Vercel Analytics:</strong> Anonymisierte Nutzungsstatistiken zur Verbesserung der
              Plattform. Es werden keine personenbezogenen Daten gespeichert.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Cookies</h2>
          <p>
            findius.io verwendet ausschließlich technisch notwendige Cookies für die Authentifizierung
            und Sitzungsverwaltung. Es werden keine Tracking-Cookies oder Werbe-Cookies eingesetzt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Datenweitergabe</h2>
          <p>
            Personenbezogene Daten werden nicht an Dritte verkauft oder zu Werbezwecken weitergegeben.
            Eine Weitergabe erfolgt nur an die unter Punkt 4 genannten Datenverarbeiter, die für den
            Betrieb der Plattform erforderlich sind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Deine Rechte</h2>
          <p>Du hast das Recht auf:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Auskunft</strong> über die zu deiner Person gespeicherten Daten</li>
            <li><strong>Berichtigung</strong> unrichtiger Daten</li>
            <li><strong>Löschung</strong> deiner Daten (Recht auf Vergessenwerden)</li>
            <li><strong>Einschränkung</strong> der Verarbeitung</li>
            <li><strong>Datenübertragbarkeit</strong></li>
            <li><strong>Widerspruch</strong> gegen die Datenverarbeitung</li>
          </ul>
          <p>
            Zur Ausübung deiner Rechte kannst du uns über die auf der Plattform angegebenen
            Kontaktmöglichkeiten erreichen. Du kannst dein Konto jederzeit löschen, wodurch alle
            zugehörigen Daten entfernt werden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Datensicherheit</h2>
          <p>
            Wir setzen technische und organisatorische Maßnahmen ein, um deine Daten zu schützen.
            Die Übertragung erfolgt verschlüsselt über HTTPS. Die Authentifizierung erfolgt
            passwortlos über Magic Links, was ein hohes Sicherheitsniveau gewährleistet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Änderungen</h2>
          <p>
            Diese Datenschutzerklärung kann jederzeit angepasst werden. Die aktuelle Version ist
            stets auf dieser Seite abrufbar.
          </p>
        </section>
      </div>
    </div>
  );
}

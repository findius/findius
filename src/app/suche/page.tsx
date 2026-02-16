import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Suche | findius",
  description: "Durchsuche findius nach Produktvergleichen, Ratgebern und Tools.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SuchePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h1 className="mb-2 text-2xl font-bold">Suche</h1>
        <p className="text-muted-foreground">
          Die Suchfunktion wird bald verfügbar sein.
        </p>
      </div>
    </div>
  );
}

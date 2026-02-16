import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug} | Tools | findius`,
    description: `findius Tool: ${slug}`,
    alternates: {
      canonical: `https://findius.io/tools/${slug}`,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;

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
        <Wrench className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h1 className="mb-2 text-2xl font-bold">Tool: {slug}</h1>
        <p className="text-muted-foreground">
          Dieses Tool wird bald verfügbar sein.
        </p>
      </div>
    </div>
  );
}

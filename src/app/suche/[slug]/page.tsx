import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Page } from '@/lib/supabase';
import { MDXRenderer } from '@/components/mdx/MDXRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: page } = await supabase
    .from('pages')
    .select('title, description, index_status')
    .eq('slug', slug)
    .single<Pick<Page, 'title' | 'description' | 'index_status'>>();

  if (!page) {
    return { title: 'Nicht gefunden | findius' };
  }

  return {
    title: `${page.title} | findius`,
    description: page.description || undefined,
    robots: {
      index: page.index_status === 'index',
      follow: true,
    },
    alternates: {
      canonical: `https://findius.io/suche/${slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description || undefined,
      url: `https://findius.io/suche/${slug}`,
      siteName: 'findius',
      type: 'article',
      locale: 'de_DE',
    },
  };
}

export default async function SucheSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single<Page>();

  if (!page) {
    notFound();
  }

  // Increment views (fire and forget)
  supabase.rpc('increment_page_views', { page_slug: slug }).then(() => {});

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="mb-4 text-lg text-muted-foreground">
            {page.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {page.category && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {page.category}
            </span>
          )}
          <time dateTime={page.created_at}>
            {new Date(page.created_at).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        <p className="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Dieser Vergleich wurde mit KI-Unterstützung erstellt. Alle Angaben
          ohne Gewähr. Bitte prüfe die Informationen vor einer Entscheidung.
        </p>
      </header>

      <MDXRenderer source={page.content_mdx} />
    </article>
  );
}

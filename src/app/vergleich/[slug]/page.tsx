import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMDXBySlug, getAllSlugs } from "@/lib/mdx";
import { MDXRenderer } from "@/components/mdx/MDXRenderer";
import Comments from "@/components/Comments";
import PageRating from "@/components/PageRating";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs("vergleiche");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getMDXBySlug("vergleiche", slug);

  if (!post) {
    return { title: "Nicht gefunden" };
  }

  const { frontmatter } = post;

  return {
    title: `${frontmatter.title} | findius`,
    description: frontmatter.description,
    keywords: frontmatter.seoKeywords,
    alternates: {
      canonical: `https://findius.io/vergleich/${slug}`,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: `https://findius.io/vergleich/${slug}`,
      siteName: "findius",
      type: "article",
      locale: "de_DE",
      publishedTime: frontmatter.publishedAt,
      modifiedTime: frontmatter.updatedAt,
      authors: [frontmatter.author],
    },
  };
}

export default async function VergleichPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getMDXBySlug("vergleiche", slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content } = post;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    author: {
      "@type": "Organization",
      name: frontmatter.author,
    },
    publisher: {
      "@type": "Organization",
      name: "findius",
      url: "https://findius.io",
    },
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
    mainEntityOfPage: `https://findius.io/vergleich/${slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          {frontmatter.title}
        </h1>
        <p className="mb-4 text-lg text-muted-foreground">
          {frontmatter.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={frontmatter.publishedAt}>
            {new Date(frontmatter.publishedAt).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {frontmatter.updatedAt && (
            <span>
              (aktualisiert:{" "}
              {new Date(frontmatter.updatedAt).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              )
            </span>
          )}
          <span>{frontmatter.author}</span>
        </div>
        {frontmatter.affiliateDisclosure && (
          <p className="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Dieser Artikel enthält Affiliate-Links. Wenn du über diese Links ein
            Produkt kaufst, erhalten wir eine kleine Provision — für dich
            entstehen keine Mehrkosten.
          </p>
        )}
      </header>

      <MDXRenderer source={content} />

      <PageRating pageSlug={slug} />
      <Comments pageSlug={slug} />
    </article>
  );
}

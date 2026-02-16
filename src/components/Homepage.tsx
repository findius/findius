'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Search } from 'lucide-react';
import Link from 'next/link';

const suggestedPrompts = [
  'Günstiges Depot für ETF-Sparpläne',
  'Beste Haftpflichtversicherung',
  'DSL-Tarif mit 100 Mbit',
  'Kreditkarte ohne Jahresgebühr',
  'Tagesgeldkonto mit besten Zinsen',
];

const trendingCards = [
  {
    title: 'Depot-Vergleich 2025',
    description: 'Die besten Online-Broker im Test',
    href: '/vergleich/depot',
    category: 'Finanzen',
  },
  {
    title: 'ETF-Sparplan Vergleich',
    description: 'Kostenlos ETFs besparen \u2013 wo geht\u2019s am günstigsten?',
    href: '/suche?q=Bester+ETF-Sparplan+Vergleich',
    category: 'Geldanlage',
  },
  {
    title: 'Girokonto Vergleich',
    description: 'Kostenloses Girokonto mit besten Konditionen finden',
    href: '/suche?q=Girokonto+Vergleich+kostenlos',
    category: 'Banking',
  },
];

export default function Homepage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/suche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChipClick = (prompt: string) => {
    router.push(`/suche?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center px-4 pt-20 pb-12 sm:pt-28">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="findius"
            className="mx-auto h-14 dark:hidden sm:h-16"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-dark.svg"
            alt="findius"
            className="mx-auto hidden h-14 dark:block sm:h-16"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-8 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
        >
          Was möchtest du vergleichen?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-3 text-center text-base text-muted-foreground sm:text-lg"
        >
          Beschreib dein Anliegen und erhalte einen personalisierten Vergleich
        </motion.p>

        {/* Search Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-2xl"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Beschreib dein Anliegen..."
              className="w-full rounded-2xl border border-border bg-card px-12 py-4 text-base shadow-sm transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-lg"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary p-2.5 text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.form>

        {/* Suggested Prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2"
        >
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleChipClick(prompt)}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </motion.div>

        {/* Trending Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="mt-20 w-full max-w-4xl"
        >
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Beliebte Vergleiche</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {trendingCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {card.category}
                </span>
                <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          findius.io &middot; KI-gestützte Vergleiche für bessere Entscheidungen
        </p>
      </footer>
    </div>
  );
}

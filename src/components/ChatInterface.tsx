'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SearchBar from './SearchBar';
import ProductGrid from './ProductGrid';
import type { ProductDetails } from '@/lib/amazon';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SearchResult {
  message: string;
  products: ProductDetails[];
  searchTerm: string;
}

export default function ChatInterface() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history,
            marketplace: { domain: 'www.amazon.de', language: 'de_DE' },
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Anfrage fehlgeschlagen');
        }

        const data = await response.json();

        setResult({
          message: data.message,
          products: data.products || [],
          searchTerm: query,
        });

        setHistory(data.history || []);
        setHasSearched(true);

        // Fetch evaluations in background if we got products
        if (data.products?.length > 0) {
          fetchEvaluations(query, data.products);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [history]
  );

  const fetchEvaluations = async (message: string, products: ProductDetails[]) => {
    try {
      const response = await fetch('/api/evaluate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          products,
          marketplace: { domain: 'www.amazon.de', language: 'de_DE' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult((prev) =>
          prev ? { ...prev, products: data.products } : null
        );
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    }
  };

  const handleReset = () => {
    setResult(null);
    setHistory([]);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <AnimatePresence>
        {hasSearched && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Neue Suche
              </button>
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} compact initialQuery={result?.searchTerm} />
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-8 py-20"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-center"
              >
                <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
                  find
                  <span className="text-blue-600">ius</span>
                </h1>
                <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
                  Dein smarter Produktvergleich
                </p>
              </motion.div>

              {/* Search */}
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 grid grid-cols-1 gap-6 text-center sm:grid-cols-3"
              >
                {[
                  {
                    title: 'KI-gestützt',
                    desc: 'Intelligente Produktanalyse mit GPT-4',
                  },
                  {
                    title: 'Amazon-Produkte',
                    desc: 'Millionen Produkte durchsuchen',
                  },
                  {
                    title: 'Unabhängig',
                    desc: 'Ehrliche, KI-generierte Bewertungen',
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex flex-col items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full py-8"
            >
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center gap-4 py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Suche läuft...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-950/20"
                >
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-4 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Erneut versuchen
                  </button>
                </motion.div>
              )}

              {/* Results */}
              {result && !isLoading && (
                <ProductGrid
                  products={result.products}
                  introMessage={result.message}
                />
              )}

              {/* No Results */}
              {result && result.products.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-20 text-center"
                >
                  <p className="text-lg text-zinc-500 dark:text-zinc-400">
                    Keine Produkte gefunden
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    Versuche einen anderen Suchbegriff
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          findius.io &middot; Als Amazon-Partner verdienen wir an qualifizierten Verkäufen
        </p>
      </footer>
    </div>
  );
}

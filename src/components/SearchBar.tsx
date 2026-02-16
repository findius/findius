'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_SEARCHES = [
  'Kopfhörer zum Joggen',
  'Laptop für Studenten',
  'Kaffeemaschine',
  'Geschenk für Mama',
  'Ergonomischer Bürostuhl',
  'Bluetooth Lautsprecher',
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  compact?: boolean;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, isLoading = false, compact = false, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!compact) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [compact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`relative flex items-center rounded-full border-2 bg-white dark:bg-zinc-900 shadow-lg transition-all duration-300 ${
            isFocused
              ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20'
              : 'border-zinc-200 dark:border-zinc-700'
          }`}
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className={`absolute h-5 w-5 text-zinc-400 ${compact ? 'left-3 h-4 w-4' : 'left-5'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Was suchst du?"
            className={`w-full rounded-full bg-transparent outline-none placeholder:text-zinc-400 dark:text-white ${
              compact ? 'py-2.5 pl-10 pr-28 text-sm' : 'py-4 pl-14 pr-36 text-lg'
            }`}
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`absolute right-2 flex items-center gap-2 rounded-full bg-blue-600 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed ${
              compact ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Finde es raus
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {!compact && (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {POPULAR_SEARCHES.map((suggestion) => (
            <motion.button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
      )}
    </div>
  );
}

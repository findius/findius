'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { useUser } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferralBanner({ pageSlug }: { pageSlug: string }) {
  const { user, profile } = useUser();
  const [copied, setCopied] = useState(false);

  if (!user || !profile?.username) return null;

  const referralUrl = `https://findius.io/vergleich/${pageSlug}?ref=${profile.username}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            Teile diesen Vergleich und verdiene mit! 🔗
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="copied" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Kopiert!
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" /> Link kopieren
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

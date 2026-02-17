'use client';

import Link from 'next/link';
import { useUser } from './AuthProvider';
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import ReputationBadge from './ReputationBadge';

export default function AuthButton() {
  const { user, profile, loading, signOut } = useUser();

  if (loading) return null;

  if (user) {
    return (
      <div className="fixed right-16 top-4 z-[60] flex items-center gap-2">
        <Link href="/dashboard">
          <motion.div
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LayoutDashboard className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            <span className="hidden text-sm text-zinc-600 dark:text-zinc-300 sm:inline">
              {profile?.username ?? 'Dashboard'}
            </span>
            {profile?.reputation_rank && (
              <span className="hidden sm:inline">
                <ReputationBadge rank={profile.reputation_rank} />
              </span>
            )}
          </motion.div>
        </Link>
        <motion.button
          onClick={signOut}
          className="flex h-10 items-center rounded-full border border-zinc-200 bg-white px-2.5 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Ausloggen"
        >
          <LogOut className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        </motion.button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <motion.div
        className="fixed right-16 top-4 z-[60] flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LogIn className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        <span className="hidden text-sm text-zinc-600 dark:text-zinc-300 sm:inline">
          Login
        </span>
      </motion.div>
    </Link>
  );
}

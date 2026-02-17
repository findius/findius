'use client';

import Link from 'next/link';
import { useUser } from './AuthProvider';
import { LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthButton() {
  const { user, profile, loading, signOut } = useUser();

  if (loading) return null;

  if (user) {
    return (
      <motion.button
        onClick={signOut}
        className="fixed right-16 top-4 z-[60] flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={profile?.username ?? user.email ?? 'Ausloggen'}
      >
        <LogOut className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        <span className="hidden text-sm text-zinc-600 dark:text-zinc-300 sm:inline">
          {profile?.username ?? 'Logout'}
        </span>
      </motion.button>
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

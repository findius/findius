'use client';

import { Shield } from 'lucide-react';

interface ReputationBadgeProps {
  rank: string;
  points?: number;
  showPoints?: boolean;
  size?: 'sm' | 'md';
}

const rankConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Neuling': { color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800', border: 'border-zinc-200 dark:border-zinc-700' },
  'Finder': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800' },
  'Experte': { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800' },
  'Top-Finder': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800' },
};

export default function ReputationBadge({ rank, points, showPoints = false, size = 'sm' }: ReputationBadgeProps) {
  const config = rankConfig[rank] || rankConfig['Neuling'];
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-0.5' : 'text-xs px-2 py-1 gap-1';
  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${config.bg} ${config.border} ${sizeClasses}`}>
      <Shield className={iconSize} />
      {rank}
      {showPoints && points !== undefined && (
        <span className="opacity-70">({points})</span>
      )}
    </span>
  );
}

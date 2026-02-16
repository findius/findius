'use client';

import { Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProductDetails } from '@/lib/amazon';

interface ProductCardProps {
  product: ProductDetails;
  index: number;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-600 dark:text-zinc-600'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {rating > 0 ? rating.toFixed(1) : '–'}
        {count > 0 && ` (${count.toLocaleString('de-DE')})`}
      </span>
    </div>
  );
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
    >
      <a
        href={product.detailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full"
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 dark:border-zinc-800 dark:bg-[#252729] dark:hover:border-blue-800 dark:hover:shadow-blue-900/10">
          {/* Image */}
          <div className="relative flex items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-800/50">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-800 group-hover:text-blue-700 dark:text-zinc-200 dark:group-hover:text-blue-400">
              {product.title}
            </h3>

            <StarRating
              rating={product.starRating || 0}
              count={product.reviewCount || 0}
            />

            {product.evaluation && (
              <p className="mt-auto text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {product.evaluation}
              </p>
            )}

            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
                Auf Amazon ansehen
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

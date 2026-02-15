'use client';

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import type { ProductDetails } from '@/lib/amazon';

interface ProductGridProps {
  products: ProductDetails[];
  introMessage?: string;
}

export default function ProductGrid({ products, introMessage }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {introMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-950/20"
        >
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {introMessage}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={`${product.title}-${index}`} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}

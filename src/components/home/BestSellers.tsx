'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CookwareCard from '@/components/product/CookwareCard';
import type { Product } from '@/data/products';

const TABS = ['Featured', 'Latest', 'Top Rating'] as const;
type Tab = (typeof TABS)[number];

function filterByTab(products: Product[], tab: Tab): Product[] {
  switch (tab) {
    case 'Featured':
      return products.filter((p) => p.isFeatured || p.isBestSeller);
    case 'Latest':
      return [...products].reverse();
    case 'Top Rating':
      return [...products].sort((a, b) => b.rating - a.rating);
  }
}

export default function BestSellers({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('Featured');

  const filtered = filterByTab(products, activeTab);

  return (
    <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="font-heading text-3xl text-center mb-8 font-semibold">
        Best Seller
      </h2>

      {/* Tab Bar */}
      <div className="flex justify-center gap-8 border-b border-cream-dark mb-10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === activeTab ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal/70'
            }`}
          >
            {tab}
            {tab === activeTab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filtered.slice(0, 4).map((product) => (
            <CookwareCard key={product.id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

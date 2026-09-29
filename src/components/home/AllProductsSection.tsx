'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CookwareCard from '@/components/product/CookwareCard';
import type { Product } from '@/data/products';
import { categories } from '@/data/categories';

export default function AllProductsSection({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filterTabs = [
    { id: 'all', name: 'All' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  return (
    <section id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-sage mb-2">
          Curated Cookware
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal">
          Explore Our Collection
        </h2>
        <p className="mt-3 text-sm sm:text-base text-warm-gray">
          Engineered for everyday durability, effortless non-stick performance, and elegant tabletop presentation.
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 pb-4 overflow-x-auto no-scrollbar mb-10">
        {filterTabs.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'text-warm-gray hover:text-charcoal bg-white/70 hover:bg-white border border-cream-dark'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFilterPill"
                  className="absolute inset-0 bg-charcoal rounded-full -z-10 shadow-xs"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredProducts.map((product) => (
            <CookwareCard key={product.id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-warm-gray text-sm">No cookware items currently available in this category.</p>
        </div>
      )}
    </section>
  );
}

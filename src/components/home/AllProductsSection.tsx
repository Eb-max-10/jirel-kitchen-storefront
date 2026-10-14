'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CookwareCard from '@/components/product/CookwareCard';
import type { Product } from '@/data/products';
import { categories } from '@/data/categories';
import { getWhatsAppUrl } from '@/config/site';
import { Clock, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

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

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <section id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-sage mb-2">
          Curated Catalog
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal">
          Explore Our Collection
        </h2>
        <p className="mt-3 text-sm sm:text-base text-warm-gray">
          Engineered for everyday durability, effortless dining, and elegant tabletop presentation.
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

      {/* Product Grid or Coming Soon Empty State */}
      {filteredProducts.length > 0 ? (
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
      ) : (
        <div className="max-w-xl mx-auto my-8 p-8 sm:p-10 rounded-3xl bg-white border border-cream-dark shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center text-sage">
            <Clock className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage bg-sage/10 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Coming Soon
          </span>
          <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">
            {activeCategoryObj?.name || 'Category'} Coming Soon
          </h3>
          <p className="text-sm text-warm-gray leading-relaxed mb-6">
            We are currently curating and quality-inspecting new arrivals for our {activeCategoryObj?.name || 'upcoming'} category. In the meantime, browse our live tableware collection or contact us directly on WhatsApp for custom requests.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-neutral-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={getWhatsAppUrl(`Hi Jirel Kitchen Hub, I would like to inquire about upcoming products in the ${activeCategoryObj?.name || 'kitchenware'} category.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Inquire on WhatsApp
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

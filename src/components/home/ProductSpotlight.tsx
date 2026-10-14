'use client';

import type { Product } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ProductSpotlight({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const effectivePrice = product.salePrice ?? product.basePrice;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: product.variants[0]?.id,
      name: product.name,
      variantName: product.variants[0]?.name,
      image: primaryImage?.url || '',
      price: effectivePrice,
    });
    openCart();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#F5F2EB] shadow-xs">
          <Link href={`/products/${product.slug}`}>
            <img
              src={primaryImage?.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </Link>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-sage">
              <Sparkles className="w-3.5 h-3.5" />
              Signature Featured Piece
            </span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 sm:mb-4 text-charcoal">
            {product.name}
          </h2>

          <p className="text-sm sm:text-base text-warm-gray leading-relaxed mb-5">
            {product.description}
          </p>

          {/* Genuine Trust Indicator */}
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              In Stock &bull; Nationwide Safe Transit Guarantee
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl sm:text-3xl font-bold text-charcoal">
              {formatPrice(effectivePrice)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto bg-sage hover:bg-sage-light text-white px-8 py-3.5 rounded-lg font-medium transition-colors cursor-pointer text-center shadow-xs"
            >
              Add to Cart
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-charcoal hover:text-sage border border-cream-dark hover:border-sage bg-white px-6 py-3.5 rounded-lg font-medium transition-colors text-center"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


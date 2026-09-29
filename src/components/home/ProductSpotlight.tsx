'use client';

import type { Product } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

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
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#F5F2EB]">
          <img
            src={primaryImage?.url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.salePrice && (
            <div className="absolute top-4 left-4 bg-sale-red text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs">
              Save {formatPrice(product.basePrice - product.salePrice)}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="text-xs sm:text-sm text-sage font-medium tracking-[0.15em] uppercase mb-2 sm:mb-3">
            Featured Product
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 sm:mb-4 text-charcoal">
            {product.name}
          </h2>
          <p className="text-sm sm:text-base text-warm-gray leading-relaxed mb-5">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-warm-gray">
              {product.rating} ({product.ratingCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">
              {formatPrice(effectivePrice)}
            </span>
            {product.salePrice && (
              <span className="text-warm-gray line-through text-base sm:text-lg">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          {/* Variant colors displayed */}
          {product.variants.length > 1 && (
            <div className="mb-6">
              <p className="text-xs text-warm-gray uppercase tracking-wide mb-2">Available Colors</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border-2 border-cream-dark"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span className="text-xs sm:text-sm text-warm-gray">{v.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto bg-sage hover:bg-sage-light text-white px-8 py-3.5 rounded-lg font-medium transition-colors cursor-pointer text-center"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}

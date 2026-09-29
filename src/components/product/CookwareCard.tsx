'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/data/products';

export default function CookwareCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeVariant, setActiveVariant] = useState(0);
  const { addItem } = useCart();

  const currentVariant = product.variants[activeVariant];
  const primaryImage =
    product.images.find(
      (img) =>
        img.isPrimary &&
        (!img.variantId || img.variantId === currentVariant?.id)
    ) || product.images[0];

  const effectivePrice = product.salePrice ?? product.basePrice;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: currentVariant?.id,
      name: product.name,
      variantName: currentVariant?.name,
      image: primaryImage?.url ?? '',
      price: effectivePrice,
    });
  }

  return (
    <motion.div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Sale Ribbon */}
      {product.salePrice && (
        <div className="absolute top-3 right-3 z-10 bg-sale-red text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rotate-12 rounded-sm shadow-sm">
          Sale
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F2EB]">
        <motion.img
          src={primaryImage?.url}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Action Buttons Cluster */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={
            isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
          }
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-charcoal hover:text-white transition-colors duration-150 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            aria-label="Quick view"
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-charcoal hover:text-white transition-colors duration-150 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            aria-label="Add to wishlist"
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-charcoal hover:text-white transition-colors duration-150 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-charcoal text-sm leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          {product.salePrice ? (
            <>
              <span className="text-sale-red font-semibold text-sm">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-warm-gray text-xs line-through">
                {formatPrice(product.basePrice)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-sm">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>

        {/* Variant Swatches */}
        {product.variants.length > 1 && (
          <div className="flex gap-2 mt-3 justify-center">
            {product.variants.map((variant, i) => (
              <button
                key={variant.id}
                onClick={() => setActiveVariant(i)}
                aria-label={`Select ${variant.name}`}
                className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all cursor-pointer',
                  i === activeVariant
                    ? 'ring-2 ring-offset-2 ring-charcoal border-transparent'
                    : 'border-gray-200 hover:border-gray-400'
                )}
                style={{ backgroundColor: variant.colorHex }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

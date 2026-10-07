'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Heart,
  Share2,
  Check,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Minus,
  Plus,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { siteConfig, getWhatsAppUrl } from '@/config/site';
import CookwareCard from '@/components/product/CookwareCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
  categoryName?: string;
}

const categoryDefaultSpecs: Record<string, Record<string, string>> = {
  'pots-pans': {
    'Material': 'Cast Aluminum & Ceramic Non-Stick Coating',
    'Heat Compatibility': 'Gas, Electric, Induction, Ceramic, Halogen',
    'Oven Safe': 'Oven safe up to 230°C (450°F)',
    'Dishwasher Safe': 'Hand wash recommended with soft sponge',
    'Toxin-Free Safety': '100% Free of PTFE, PFOA, lead & cadmium',
    'Handles': 'Stay-cool ergonomic stainless steel riveted handles',
    'Warranty': '1 Year Manufacturer Warranty against defects',
  },
  'knives': {
    'Blade Material': 'High-Carbon German Stainless Steel (1.4116)',
    'Handle Material': 'Ergonomic Moisture-Resistant Pakkawood',
    'Cutting Edge': '15° precision double-bevel razor edge',
    'Hardness Rating': '56±2 HRC Rockwell Hardness',
    'Care Instructions': 'Hand wash and dry immediately with soft towel',
    'Warranty': 'Lifetime Limited Manufacturer Warranty',
  },
  'appliances': {
    'Power Rating': '220V - 240V / 50Hz (Nigerian Standard Plug)',
    'Capacity': '1.8L (up to 10 cups cooked rice)',
    'Inner Pot Liner': 'Heavy-duty non-stick coated aluminum',
    'Smart Features': 'Digital fuzzy logic, 12h keep warm, delay timer',
    'Safety Protection': 'Auto shut-off, thermal overheat fuse',
    'Warranty': '1 Year Full Replacement Warranty',
  },
  'tableware': {
    'Material': 'High-fired porcelain stoneware',
    'Microwave Safe': 'Yes, fully microwave safe',
    'Dishwasher Safe': 'Yes, dishwasher safe',
    'Glaze Finish': 'Scratch-resistant semi-matte satin glaze',
    'Care & Durability': 'Resistant to thermal shock and chipping',
    'Warranty': 'Transit breakage replacement guarantee upon delivery',
  },
  'utensils': {
    'Material': '100% Organic Moso Bamboo & Food-Grade Silicone',
    'Heat Resistance': 'Heat resistant up to 220°C (428°F)',
    'Cookware Safe': 'Safe for all non-stick, ceramic, and stainless surfaces',
    'Finish': 'Natural food-safe mineral oil seal',
    'Care Instructions': 'Hand wash with mild soap, air dry thoroughly',
    'Warranty': '1 Year Quality Guarantee',
  },
  'bakeware': {
    'Material': 'Heavy-gauge aluminized steel with reinforced steel rims',
    'Coating': 'Double-layer silicone non-stick release coating',
    'Oven Safe': 'Oven safe up to 260°C (500°F)',
    'Dishwasher Safe': 'Yes, hand wash recommended for longevity',
    'Dimensions': '43cm x 30cm x 2.5cm',
    'Warranty': '2 Year Limited Warranty',
  },
};

export default function ProductDetailView({
  product,
  relatedProducts = [],
  categoryName,
}: ProductDetailViewProps) {
  const { addItem, updateQuantity, openCart } = useCart();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'shipping'>('specs');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const selectedVariant = product.variants[selectedVariantIndex];
  const effectivePrice = product.salePrice ?? product.basePrice;
  const isSale = Boolean(product.salePrice && product.salePrice < product.basePrice);
  const savings = isSale ? product.basePrice - (product.salePrice as number) : 0;
  const savingsPercentage = isSale
    ? Math.round((savings / product.basePrice) * 100)
    : 0;

  // Active gallery image
  const activeImage =
    product.images[selectedImageIndex] ||
    product.images.find((img) => img.isPrimary) ||
    product.images[0];

  // Resolve specs: merge explicit specs with category defaults
  const categorySpecs = categoryDefaultSpecs[product.categoryId] || categoryDefaultSpecs['pots-pans'];
  const specs = {
    ...categorySpecs,
    ...(product.specs || {}),
  };

  // Sync variant selection with gallery
  const handleSelectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    const variant = product.variants[index];
    if (variant) {
      const matchIdx = product.images.findIndex((img) => img.variantId === variant.id);
      if (matchIdx !== -1) {
        setSelectedImageIndex(matchIdx);
      }
    }
  };

  // Sync image click with variant (if image is linked to a variant)
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    const img = product.images[index];
    if (img?.variantId) {
      const variantIdx = product.variants.findIndex((v) => v.id === img.variantId);
      if (variantIdx !== -1) {
        setSelectedVariantIndex(variantIdx);
      }
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      image: activeImage?.url || '',
      price: effectivePrice,
    });

    if (quantity > 1) {
      updateQuantity(product.id, selectedVariant?.id, quantity);
    }

    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2200);
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `${siteConfig.url}/products/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | ${siteConfig.name}`,
          text: product.description,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch {
        // Ignore clipboard errors
      }
    }
  };

  // Pre-filled WhatsApp inquiry link
  const variantText = selectedVariant ? ` (${selectedVariant.name})` : '';
  const waInquiry = `Hi Jirel Kitchen Hub, I would like to order:
• Product: ${product.name}${variantText}
• Quantity: ${quantity}
• Total Price: ${formatPrice(effectivePrice * quantity)}

Please confirm stock availability and delivery timeline for my location in Nigeria.`;
  const whatsappUrl = getWhatsAppUrl(waInquiry);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast notifications */}
      <AnimatePresence>
        {showAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-charcoal text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-semibold">Added to cart!</p>
              <p className="text-xs text-warm-gray">{quantity}x {product.name}</p>
            </div>
          </motion.div>
        )}

        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-charcoal text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Product link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-warm-gray">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-warm-gray/60" />
        <Link href="/#all-products" className="hover:text-charcoal transition-colors">
          Cookware
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-warm-gray/60" />
            <span className="text-warm-gray">{categoryName}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-warm-gray/60" />
        <span className="text-charcoal font-medium truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery (5 cols on lg) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          {/* Main Stage Frame */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F2EB] border border-cream-dark shadow-sm">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {isSale && (
                <span className="bg-sale-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                  Save {formatPrice(savings)} ({savingsPercentage}% off)
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-charcoal text-white text-xs font-semibold px-3 py-1 rounded-md shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Best Seller
                </span>
              )}
              {product.isFeatured && !product.isBestSeller && (
                <span className="bg-sage text-white text-xs font-semibold px-3 py-1 rounded-md shadow-xs">
                  Featured
                </span>
              )}
            </div>

            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Save to wishlist"
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
              >
                <Heart
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isWishlisted ? 'text-sale-red fill-sale-red' : 'text-charcoal'
                  )}
                />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share product"
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center hover:bg-white text-charcoal transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage?.url}
                src={activeImage?.url}
                alt={activeImage?.alt || product.name}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => handleSelectImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={cn(
                    'relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-[#F5F2EB] shrink-0 border-2 transition-all cursor-pointer',
                    idx === selectedImageIndex
                      ? 'border-sage ring-2 ring-sage/30 ring-offset-2'
                      : 'border-cream-dark opacity-75 hover:opacity-100 hover:border-gray-300'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || `${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <span className="absolute bottom-1 right-1 bg-charcoal/80 text-white text-[9px] px-1 rounded-xs">
                      Main
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.15em] font-semibold text-sage">
                {categoryName || 'Culinary Essentials'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock &bull; Dispatches in 24h
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.floor(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : i < product.rating
                        ? 'text-amber-400 fill-amber-400/50'
                        : 'text-gray-200 fill-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-charcoal">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs sm:text-sm text-warm-gray">
                ({product.ratingCount} verified customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-cream-dark shadow-xs space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-charcoal">
                {formatPrice(effectivePrice)}
              </span>
              {isSale && (
                <span className="text-base sm:text-lg text-warm-gray line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            <div className="text-xs text-warm-gray flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Prices inclusive of VAT</span>
              <span>&bull;</span>
              <span className="text-sage font-medium">Free delivery over ₦80,000</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-warm-gray leading-relaxed">
            {product.description}
          </p>

          {/* Variant Swatches Picker */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-cream-dark">
              <div className="flex items-center justify-between text-sm">
                <span className="text-warm-gray">
                  Color / Finish:{' '}
                  <span className="font-semibold text-charcoal">
                    {selectedVariant?.name || 'Default'}
                  </span>
                </span>
                <span className="text-xs text-warm-gray">
                  {product.variants.length} options available
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {product.variants.map((v, idx) => {
                  const isSelected = idx === selectedVariantIndex;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVariant(idx)}
                      aria-label={`Select ${v.name} finish`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer text-xs font-medium',
                        isSelected
                          ? 'border-charcoal bg-white shadow-xs'
                          : 'border-cream-dark bg-white hover:border-gray-400 text-warm-gray'
                      )}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Cart Triggers */}
          <div className="space-y-4 pt-2 border-t border-cream-dark">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-charcoal">Quantity:</span>
              <div className="inline-flex items-center rounded-xl border border-cream-dark bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-2 sm:p-2.5 text-charcoal hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-sm text-charcoal">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  disabled={quantity >= 20}
                  aria-label="Increase quantity"
                  className="p-2 sm:p-2.5 text-charcoal hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer rounded-r-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-warm-gray">
                Subtotal:{' '}
                <span className="font-semibold text-charcoal">
                  {formatPrice(effectivePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-sage hover:bg-sage-light text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-sm sm:text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-charcoal hover:bg-black text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-sm sm:text-base"
              >
                Buy Now
              </button>
            </div>

            {/* WhatsApp Concierge Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-xs transition-colors text-sm cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-white" />
              <span>Order via WhatsApp Concierge</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream-dark">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-cream-dark/60">
              <Truck className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-charcoal">Nationwide Delivery</p>
                <p className="text-warm-gray">24-48h Lagos & Abuja</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-cream-dark/60">
              <ShieldCheck className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-charcoal">100% Authentic</p>
                <p className="text-warm-gray">Verified craftsmanship</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-cream-dark/60">
              <Lock className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-charcoal">Paystack Secured</p>
                <p className="text-warm-gray">Cards & Bank Transfer</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-cream-dark/60">
              <RotateCcw className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-charcoal">7-Day Inspection</p>
                <p className="text-warm-gray">Hassle-free replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details Tabs Section */}
      <section className="mt-16 pt-10 border-t border-cream-dark">
        <div className="flex gap-2 sm:gap-4 border-b border-cream-dark pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={cn(
              'pb-3 text-sm sm:text-base font-semibold border-b-2 transition-colors cursor-pointer shrink-0',
              activeTab === 'specs'
                ? 'border-sage text-sage'
                : 'border-transparent text-warm-gray hover:text-charcoal'
            )}
          >
            Product Specifications
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={cn(
              'pb-3 text-sm sm:text-base font-semibold border-b-2 transition-colors cursor-pointer shrink-0',
              activeTab === 'description'
                ? 'border-sage text-sage'
                : 'border-transparent text-warm-gray hover:text-charcoal'
            )}
          >
            Culinary Highlights & Care
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={cn(
              'pb-3 text-sm sm:text-base font-semibold border-b-2 transition-colors cursor-pointer shrink-0',
              activeTab === 'shipping'
                ? 'border-sage text-sage'
                : 'border-transparent text-warm-gray hover:text-charcoal'
            )}
          >
            Shipping & Fulfillment
          </button>
        </div>

        <div className="py-8">
          {/* Specs Table */}
          {activeTab === 'specs' && (
            <div className="max-w-4xl bg-white rounded-2xl border border-cream-dark overflow-hidden shadow-xs">
              <div className="px-6 py-4 bg-cream/60 border-b border-cream-dark">
                <h3 className="font-semibold text-charcoal text-sm sm:text-base">
                  Technical Specifications & Compatibility
                </h3>
              </div>
              <div className="divide-y divide-cream-dark">
                {Object.entries(specs).map(([key, value], idx) => (
                  <div
                    key={key}
                    className={cn(
                      'grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-sm',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/40'
                    )}
                  >
                    <span className="font-medium text-warm-gray">{key}</span>
                    <span className="sm:col-span-2 font-semibold text-charcoal mt-1 sm:mt-0">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Care */}
          {activeTab === 'description' && (
            <div className="max-w-4xl bg-white rounded-2xl border border-cream-dark p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-3">
                  About {product.name}
                </h3>
                <p className="text-warm-gray leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>

              <div className="pt-4 border-t border-cream-dark">
                <h4 className="font-semibold text-charcoal text-sm sm:text-base mb-3">
                  Why Nigerian Home Cooks & Chefs Love It
                </h4>
                <ul className="space-y-2 text-sm text-warm-gray">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                    <span>Engineered for both traditional slow-simmered dishes and modern rapid searing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                    <span>Even heat conduction across gas burners, electric stoves, and modern induction cooktops.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                    <span>Non-reactive culinary surfaces preserve the vibrant flavors of tomatoes, peppers, and spices.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-cream-dark">
                <h4 className="font-semibold text-charcoal text-sm sm:text-base mb-3">
                  Care & Maintenance Guidelines
                </h4>
                <p className="text-sm text-warm-gray leading-relaxed">
                  Allow cookware to cool completely before washing. Use warm soapy water and a soft non-abrasive sponge or microfiber cloth. For knives, hand wash and towel-dry immediately. Store in a dry pantry or on a magnetic knife strip to protect the cutting edge.
                </p>
              </div>
            </div>
          )}

          {/* Shipping Rates & Info */}
          {activeTab === 'shipping' && (
            <div className="max-w-4xl bg-white rounded-2xl border border-cream-dark p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
                  Delivery Rates & Logistics
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  We fulfill and dispatch orders daily from our Lagos fulfillment center to all 36 states and the Federal Capital Territory.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-cream/70 border border-cream-dark">
                  <p className="text-xs uppercase tracking-wider text-sage font-semibold">Lagos State</p>
                  <p className="font-heading text-xl font-bold text-charcoal mt-1">
                    {formatPrice(siteConfig.shipping.rates.lagos)}
                  </p>
                  <p className="text-xs text-warm-gray mt-1">
                    Delivered in {siteConfig.shipping.estimates.lagosAndAbuja}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cream/70 border border-cream-dark">
                  <p className="text-xs uppercase tracking-wider text-sage font-semibold">Abuja & Port Harcourt</p>
                  <p className="font-heading text-xl font-bold text-charcoal mt-1">
                    {formatPrice(siteConfig.shipping.rates.abujaAndPH)}
                  </p>
                  <p className="text-xs text-warm-gray mt-1">
                    Delivered in {siteConfig.shipping.estimates.lagosAndAbuja}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cream/70 border border-cream-dark">
                  <p className="text-xs uppercase tracking-wider text-sage font-semibold">Nationwide (Other States)</p>
                  <p className="font-heading text-xl font-bold text-charcoal mt-1">
                    {formatPrice(siteConfig.shipping.rates.nationwide)}
                  </p>
                  <p className="text-xs text-warm-gray mt-1">
                    Delivered in {siteConfig.shipping.estimates.nationwide}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Free Nationwide Delivery:</strong> Applicable on all qualifying cart orders over{' '}
                  {formatPrice(siteConfig.shipping.rates.freeThreshold)}.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-cream-dark">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-sage">
                Recommended For You
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mt-1">
                Complete Your Kitchen
              </h2>
            </div>
            <Link
              href="/#all-products"
              className="text-xs sm:text-sm font-semibold text-sage hover:text-sage-light transition-colors flex items-center gap-1"
            >
              View Full Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((related) => (
              <CookwareCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

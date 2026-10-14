"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  priceBadge: string;
  originalPrice: string | null;
  ctaText: string;
  ctaType: "cart" | "link";
  link?: string;
  productPayload?: {
    productId: string;
    name: string;
    variantName?: string;
    image: string;
    price: number;
  };
  bgImage: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    tag: "ARTISAN DINING",
    title: "16-Piece Matte Ceramic Dinnerware Set",
    subtitle:
      "Crafted from premium durable ceramic with contemporary ribbed contours. Microwave and dishwasher safe, engineered for daily dining and effortless entertaining.",
    priceBadge: "₦55,000",
    originalPrice: null,
    ctaText: "Order Now",
    ctaType: "cart",
    link: "/products/16-piece-matte-ceramic-dinnerware-s-1",
    productPayload: {
      productId: "item-1",
      name: "16-Piece Matte Ceramic Dinnerware Set",
      variantName: "Standard Studio",
      image: "/images/products/16-piece-matte-ceramic-dinnerware-s-1.webp",
      price: 55000,
    },
    bgImage: "/images/products/16-piece-matte-ceramic-dinnerware-s-1.webp",
  },
  {
    id: 2,
    tag: "ELEGANT ENTERTAINING",
    title: "24-Piece Gold Cutlery Set with Stand",
    subtitle:
      "Mirror-polished gold stainless steel flatware service complete with a transparent display organizer. Rust-resistant, balanced ergonomics, and tarnish-free.",
    priceBadge: "₦25,000",
    originalPrice: null,
    ctaText: "Order Now",
    ctaType: "cart",
    link: "/products/24-piece-gold-stainless-steel-flatw-10",
    productPayload: {
      productId: "item-10",
      name: "24-Piece Gold Stainless Steel Flatware Tableware Set",
      variantName: "Standard Studio",
      image: "/images/products/24-piece-gold-stainless-steel-flatw-10.webp",
      price: 25000,
    },
    bgImage: "/images/products/24-piece-gold-stainless-steel-flatw-10.webp",
  },
  {
    id: 3,
    tag: "SIGNATURE BANQUET COLLECTION",
    title: "32-Piece Luxury Gold Tree Ceramic Set",
    subtitle:
      "Complete banquet dining service featuring intricate gold detailing and kiln-fired porcelain craftsmanship for celebrations and special family gatherings.",
    priceBadge: "₦65,000",
    originalPrice: null,
    ctaText: "Order Now",
    ctaType: "cart",
    link: "/products/32-piece-luxury-gold-tree-ceramic-d-6",
    productPayload: {
      productId: "item-6",
      name: "32-Piece Luxury Gold Tree Ceramic Dinner Set",
      variantName: "Standard Studio",
      image: "/images/products/32-piece-luxury-gold-tree-ceramic-d-6.webp",
      price: 65000,
    },
    bgImage: "/images/products/32-piece-luxury-gold-tree-ceramic-d-6.webp",
  },
];

const AUTOPLAY_INTERVAL = 6000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { addItem, openCart } = useCart();

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  const activeSlide = SLIDES[current];

  const handleCtaClick = () => {
    if (activeSlide.ctaType === "cart" && activeSlide.productPayload) {
      addItem(activeSlide.productPayload);
      openCart();
    } else if (activeSlide.link) {
      const el = document.querySelector(activeSlide.link);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative min-h-[520px] h-[78vh] sm:h-[82vh] sm:min-h-[580px] w-full overflow-hidden bg-neutral-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured Promotions Carousel"
    >
      {/* Background Image with Ken Burns Zoom & Crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 z-0 h-full w-full"
        >
          <motion.img
            src={activeSlide.bgImage}
            alt={activeSlide.title}
            initial={{ scale: 1 }}
            animate={{ scale: 1.06 }}
            transition={{ duration: 7, ease: "easeOut" }}
            className="h-full w-full object-cover object-center"
          />
          {/* Dual Overlay: Left readability gradient + soft overall darkening */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Main Slide Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8 lg:px-12 pb-16 sm:pb-0">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Category / Collection Tag */}
              <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
                {activeSlide.tag}
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl xs:text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] sm:leading-[1.1]">
                {activeSlide.title}
              </h1>

              {/* Subtitle */}
              <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-neutral-300 sm:text-lg max-w-xl">
                {activeSlide.subtitle}
              </p>

              {/* Price / Offer Highlight */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-lg bg-[#3D5449] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm">
                  {activeSlide.priceBadge}
                </span>
                {activeSlide.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    {activeSlide.originalPrice}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleCtaClick}
                  className="group flex items-center gap-2.5 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 shadow-xl transition-all duration-200 hover:bg-[#FAF7F2] hover:shadow-2xl active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                  {activeSlide.ctaText}
                </button>
                {activeSlide.link && (
                  <a
                    href={activeSlide.link}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-black/30 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 cursor-pointer"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>



      {/* Navigation Controls & Progress Timers (Bottom Center/Left) */}
      <div className="absolute bottom-5 sm:bottom-8 left-5 sm:left-6 z-20 flex items-center gap-3 sm:gap-4 lg:left-12">
        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-white hover:text-black cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-white hover:text-black cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Progress Bars */}
        <div className="flex items-center gap-2">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === current;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrent(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className="group relative h-1.5 w-10 overflow-hidden rounded-full bg-white/25 transition-all hover:bg-white/40 cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    key={`progress-${current}-${isPaused}`}
                    initial={{ width: "0%" }}
                    animate={{ width: isPaused ? "0%" : "100%" }}
                    transition={{
                      duration: isPaused ? 0 : AUTOPLAY_INTERVAL / 1000,
                      ease: "linear",
                    }}
                    className="h-full bg-white"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

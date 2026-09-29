'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

const emptySubscribe = () => () => {};

export default function Header() {
  const { cartCount, openCart } = useCart();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Shop', href: '#all-products' },
    { name: 'Best Sellers', href: '#best-sellers' },
    { name: 'Help & Contact', href: '#contact' },
  ];

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Nav links (desktop) / Hamburger (mobile) */}
          <div className="flex items-center">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -ml-2 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollClick(e, link.href)}
                  className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-heading text-xl md:text-2xl font-bold text-charcoal tracking-tight">
              Jirel Kitchen
            </h1>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button aria-label="Search" className="p-2 text-warm-gray hover:text-charcoal transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
            <button aria-label="Wishlist" className="p-2 text-warm-gray hover:text-charcoal transition-colors cursor-pointer hidden sm:block">
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={openCart}
              aria-label="Open cart"
              className="relative p-2 text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Cart badge - only render after mount to prevent hydration mismatch */}
              <AnimatePresence>
                {isMounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-sage text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-cream-dark bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollClick(e, link.href)}
                  className="block text-sm font-medium text-warm-gray hover:text-charcoal transition-colors py-1 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

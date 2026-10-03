import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jirel Hitchen Hub — Premium Kitchenware & Cookware',
  description:
    'Shop premium cookware, knives, and kitchen essentials. Quality kitchenware delivered across Nigeria.',
  keywords: ['kitchenware', 'cookware', 'Nigeria', 'pots', 'pans', 'knives', 'kitchen'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-cream font-body text-charcoal antialiased min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

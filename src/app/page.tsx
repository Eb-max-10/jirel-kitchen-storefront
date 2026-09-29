import { products, getFeaturedProduct } from '@/data/products';
import { activePromo } from '@/data/promo';

import HeroSection from '@/components/home/HeroSection';
import TrustBar from '@/components/home/TrustBar';
import BestSellers from '@/components/home/BestSellers';
import AllProductsSection from '@/components/home/AllProductsSection';
import ProductSpotlight from '@/components/home/ProductSpotlight';
import PromoCountdown from '@/components/home/PromoCountdown';
import ContactSection from '@/components/home/ContactSection';

export default function Home() {
  const bestSellers = products.filter((p) => p.isBestSeller);
  const featured = getFeaturedProduct();

  return (
    <>
      <HeroSection />
      <TrustBar />
      <BestSellers products={bestSellers} />
      <AllProductsSection products={products} />
      {featured && <ProductSpotlight product={featured} />}
      {activePromo.isActive && <PromoCountdown promo={activePromo} />}
      <ContactSection />
    </>
  );
}

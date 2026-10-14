import { products, getFeaturedProduct } from '@/data/products';

import HeroSection from '@/components/home/HeroSection';
import TrustBar from '@/components/home/TrustBar';
import BestSellers from '@/components/home/BestSellers';
import AllProductsSection from '@/components/home/AllProductsSection';
import ProductSpotlight from '@/components/home/ProductSpotlight';
import ContactSection from '@/components/home/ContactSection';

export default function Home() {
  const featured = getFeaturedProduct();

  return (
    <>
      <HeroSection />
      <TrustBar />
      <BestSellers products={products} />
      <AllProductsSection products={products} />
      {featured && <ProductSpotlight product={featured} />}
      <ContactSection />
    </>
  );
}

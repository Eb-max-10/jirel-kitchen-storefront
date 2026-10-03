import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  getCategoryById,
} from '@/lib/catalog';
import { siteConfig } from '@/config/site';
import ProductDetailView from '@/components/product/ProductDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Pre-render all catalog product routes statically at build time.
 */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

/**
 * Generate dynamic OpenGraph, Twitter, and SEO tags for social sharing.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: `Product Not Found | ${siteConfig.name}`,
      description: 'The requested cookware product could not be located in our catalog.',
    };
  }

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const ogImageUrl = primaryImage?.url || '';

  const pageUrl = `${siteConfig.url}/products/${slug}`;
  const pageTitle = `${product.name} | ${siteConfig.name}`;

  return {
    title: pageTitle,
    description: product.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: product.description,
      url: pageUrl,
      siteName: siteConfig.name,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
      type: 'website',
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: product.description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

/**
 * Dynamic Product Detail Route (/products/[slug])
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch category name and related products
  const [allCategoryProducts, category] = await Promise.all([
    getProductsByCategory(product.categoryId),
    getCategoryById(product.categoryId),
  ]);

  let related = allCategoryProducts.filter((p) => p.id !== product.id);
  if (related.length < 4) {
    const all = await getAllProducts();
    const extra = all.filter(
      (p) => p.id !== product.id && !related.some((r) => r.id === p.id)
    );
    related = [...related, ...extra].slice(0, 4);
  }

  return (
    <main className="min-h-screen bg-cream py-8 sm:py-12">
      <ProductDetailView
        product={product}
        relatedProducts={related}
        categoryName={category?.name}
      />
    </main>
  );
}

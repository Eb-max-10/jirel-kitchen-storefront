import {
  products as mockProducts,
  type Product,
  type ProductVariant,
  type ProductImage,
} from '@/data/products';
import {
  categories as mockCategories,
  type Category,
} from '@/data/categories';
import {
  activePromo as mockPromo,
  type Promo,
} from '@/data/promo';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// Re-export core catalog interfaces for uniform usage across the app
export type { Product, ProductVariant, ProductImage, Category, Promo };

// Re-export static mock datasets for backward compatibility with synchronous callers
export {
  mockProducts as products,
  mockCategories as categories,
  mockPromo as activePromo,
};

// =============================================================================
// DATABASE ROW TRANSFORMERS (snake_case -> camelCase)
// =============================================================================

interface DbVariantRow {
  id: string;
  name: string;
  color_hex: string;
  sku?: string | null;
  price?: number | string | null;
  display_order?: number | null;
}

interface DbImageRow {
  id: string;
  variant_id?: string | null;
  url: string;
  alt: string;
  is_primary?: boolean | null;
  display_order?: number | null;
}

interface DbProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number | string;
  sale_price?: number | string | null;
  is_featured?: boolean | null;
  is_best_seller?: boolean | null;
  rating?: number | string | null;
  rating_count?: number | null;
  specs?: Record<string, string> | null;
  product_variants?: DbVariantRow[];
  product_images?: DbImageRow[];
}

interface DbCategoryRow {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  display_order?: number | null;
}

interface DbPromoRow {
  id: string;
  title: string;
  subtitle: string;
  discount_text: string;
  end_date: string;
  bg_color: string;
  is_active?: boolean | null;
}

function mapDbProductToUiProduct(row: DbProductRow): Product {
  const variants: ProductVariant[] = Array.isArray(row.product_variants)
    ? row.product_variants
        .slice()
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((v) => ({
          id: v.id,
          name: v.name,
          colorHex: v.color_hex,
          sku: v.sku ?? undefined,
          price: v.price !== null && v.price !== undefined ? Number(v.price) : undefined,
        }))
    : [];

  const images: ProductImage[] = Array.isArray(row.product_images)
    ? row.product_images
        .slice()
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((img) => ({
          id: img.id,
          variantId: img.variant_id ?? undefined,
          url: img.url,
          alt: img.alt,
          isPrimary: Boolean(img.is_primary),
        }))
    : [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.category_id,
    basePrice: Number(row.base_price),
    salePrice:
      row.sale_price !== null && row.sale_price !== undefined
        ? Number(row.sale_price)
        : undefined,
    isFeatured: Boolean(row.is_featured),
    isBestSeller: Boolean(row.is_best_seller),
    rating: Number(row.rating ?? 5.0),
    ratingCount: Number(row.rating_count ?? 0),
    specs: (row.specs as Record<string, string>) || {},
    variants,
    images,
  };
}

function mapDbCategoryToUiCategory(row: DbCategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    displayOrder: Number(row.display_order ?? 0),
  };
}

function mapDbPromoToUiPromo(row: DbPromoRow): Promo {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    discountText: row.discount_text,
    endDate: row.end_date,
    bgColor: row.bg_color,
    isActive: Boolean(row.is_active),
  };
}

// =============================================================================
// CATALOG API (ASYNC DATA LAYER WITH ZERO-BREAKAGE MOCK FALLBACK)
// =============================================================================

/**
 * Fetches all products with variants and images.
 * Falls back to mockProducts if Supabase is unavailable.
 */
export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockProducts;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return mockProducts;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[Catalog] Supabase query notice:', error.message);
      return mockProducts;
    }

    return (data as unknown as DbProductRow[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.warn('[Catalog] Error querying Supabase products, falling back to mock:', err);
    return mockProducts;
  }
}

/**
 * Fetches a single product by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.slug === slug);
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return mockProducts.find((p) => p.slug === slug);

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return mockProducts.find((p) => p.slug === slug);
    }

    return mapDbProductToUiProduct(data as unknown as DbProductRow);
  } catch {
    return mockProducts.find((p) => p.slug === slug);
  }
}

/**
 * Fetches a single product by ID.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.id === id);
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return mockProducts.find((p) => p.id === id);

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return mockProducts.find((p) => p.id === id);
    }

    return mapDbProductToUiProduct(data as unknown as DbProductRow);
  } catch {
    return mockProducts.find((p) => p.id === id);
  }
}

/**
 * Fetches products filtered by category ID.
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.categoryId === categoryId);
}

/**
 * Fetches the featured spotlight product.
 */
export async function getFeaturedProduct(): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.isFeatured) || all[0];
}

/**
 * Fetches best-seller products.
 */
export async function getBestSellerProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isBestSeller);
}

/**
 * Fetches all categories ordered by displayOrder.
 */
export async function getAllCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return mockCategories;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return mockCategories;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return mockCategories;
    }

    return (data as unknown as DbCategoryRow[]).map(mapDbCategoryToUiCategory);
  } catch {
    return mockCategories;
  }
}

/**
 * Fetches a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug);
}

/**
 * Fetches a single category by ID.
 */
export async function getCategoryById(id: string): Promise<Category | undefined> {
  const all = await getAllCategories();
  return all.find((c) => c.id === id);
}

/**
 * Fetches active promo banner.
 */
export async function getActivePromo(): Promise<Promo | undefined> {
  if (!isSupabaseConfigured()) {
    return mockPromo;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return mockPromo;

    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return mockPromo;
    }

    return mapDbPromoToUiPromo(data as unknown as DbPromoRow);
  } catch {
    return mockPromo;
  }
}

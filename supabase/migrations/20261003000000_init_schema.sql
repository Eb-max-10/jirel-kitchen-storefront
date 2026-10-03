-- =============================================================================
-- JIREL KITCHEN: INITIAL DATABASE SCHEMA, MIGRATIONS & RLS
-- Migration: 20261003000000_init_schema.sql
-- Region: eu-west-1
-- =============================================================================

-- Ensure cryptographic functions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 2. PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_best_seller BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
    rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_sale_price_le_base CHECK (sale_price IS NULL OR sale_price <= base_price)
);

-- =============================================================================
-- 3. PRODUCT_VARIANTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_hex VARCHAR(7) NOT NULL CHECK (color_hex ~* '^#[0-9A-Fa-f]{6}$'),
    sku TEXT UNIQUE,
    price NUMERIC(12, 2) CHECK (price IS NULL OR price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 4. PRODUCT_IMAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
    url TEXT NOT NULL CHECK (url ~* '^https?://'),
    alt TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 5. PROMOS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.promos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    discount_text TEXT NOT NULL,
    code TEXT,
    end_date TIMESTAMPTZ NOT NULL,
    bg_color VARCHAR(30) NOT NULL DEFAULT '#3D5449',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 6. ORDERS TABLE & SEQUENCE
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE DEFAULT ('JK-' || to_char(nextval('public.order_number_seq'), 'FM000000')),
    customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) > 0),
    email TEXT NOT NULL CHECK (length(trim(email)) > 0),
    customer_phone TEXT NOT NULL CHECK (length(trim(customer_phone)) >= 7),
    shipping_address TEXT NOT NULL CHECK (length(trim(shipping_address)) > 0),
    items JSONB NOT NULL CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    paystack_reference TEXT UNIQUE,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
    paid_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 7. PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order ASC);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_display_order ON public.product_variants(product_id, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_images_variant ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_images_primary ON public.product_images(product_id, is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_promos_active ON public.promos(is_active, end_date) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);

-- =============================================================================
-- 8. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_promos_updated_at ON public.promos;
CREATE TRIGGER trg_promos_updated_at
    BEFORE UPDATE ON public.promos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES & GRANTS
-- =============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Explicit Role Privileges
GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT ON TABLE public.product_variants TO anon, authenticated;
GRANT SELECT ON TABLE public.product_images TO anon, authenticated;
GRANT SELECT ON TABLE public.promos TO anon, authenticated;
GRANT INSERT ON TABLE public.orders TO anon, authenticated;

GRANT ALL ON TABLE public.categories TO service_role;
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.product_variants TO service_role;
GRANT ALL ON TABLE public.product_images TO service_role;
GRANT ALL ON TABLE public.promos TO service_role;
GRANT ALL ON TABLE public.orders TO service_role;

-- Catalog Public Read Policies
DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full management on categories" ON public.categories;
CREATE POLICY "Allow service_role full management on categories"
    ON public.categories FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full management on products" ON public.products;
CREATE POLICY "Allow service_role full management on products"
    ON public.products FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on product_variants" ON public.product_variants;
CREATE POLICY "Allow public read access on product_variants"
    ON public.product_variants FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full management on product_variants" ON public.product_variants;
CREATE POLICY "Allow service_role full management on product_variants"
    ON public.product_variants FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on product_images" ON public.product_images;
CREATE POLICY "Allow public read access on product_images"
    ON public.product_images FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full management on product_images" ON public.product_images;
CREATE POLICY "Allow service_role full management on product_images"
    ON public.product_images FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on promos" ON public.promos;
CREATE POLICY "Allow public read access on promos"
    ON public.promos FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full management on promos" ON public.promos;
CREATE POLICY "Allow service_role full management on promos"
    ON public.promos FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Orders Guest Insert Policy
DROP POLICY IF EXISTS "Allow guest order insertion" ON public.orders;
CREATE POLICY "Allow guest order insertion"
    ON public.orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Orders Service Role Full Management
DROP POLICY IF EXISTS "Allow service_role full management on orders" ON public.orders;
CREATE POLICY "Allow service_role full management on orders"
    ON public.orders FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- 10. SECURE RPC FOR PII-PROTECTED ORDER CONFIRMATION LOOKUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_order_by_reference(
    p_reference TEXT,
    p_email TEXT DEFAULT NULL
)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Guard: reject empty or null references immediately
    IF p_reference IS NULL OR trim(p_reference) = '' THEN
        RETURN;
    END IF;

    -- If customer email is supplied, require both reference and email to match
    IF p_email IS NOT NULL AND trim(p_email) <> '' THEN
        RETURN QUERY
        SELECT *
        FROM public.orders
        WHERE paystack_reference = trim(p_reference)
          AND lower(email) = lower(trim(p_email));
    ELSE
        -- Return order matching exact cryptographic reference
        RETURN QUERY
        SELECT *
        FROM public.orders
        WHERE paystack_reference = trim(p_reference);
    END IF;
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_order_by_reference(TEXT, TEXT) TO anon, authenticated;

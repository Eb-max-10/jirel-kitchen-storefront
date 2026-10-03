-- =============================================================================
-- JIREL KITCHEN E-COMMERCE SEED DATA
-- Version: 1.0.0
-- Verified Catalog: 6 Categories, 10 Products, 19 Variants, 20 Images, 1 Promo
-- =============================================================================

BEGIN;

-- 1. CATEGORIES (6 items)
INSERT INTO public.categories (id, name, slug, image_url, display_order) VALUES
('pots-pans', 'Pots & Pans', 'pots-pans', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80', 1),
('knives', 'Knives', 'knives', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&auto=format&fit=crop&q=80', 2),
('utensils', 'Utensils', 'utensils', 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&auto=format&fit=crop&q=80', 3),
('tableware', 'Tableware', 'tableware', 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=400&auto=format&fit=crop&q=80', 4),
('baking', 'Baking', 'baking', 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=400&auto=format&fit=crop&q=80', 5),
('appliances', 'Appliances', 'appliances', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=400&auto=format&fit=crop&q=80', 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order;

-- 2. PRODUCTS (10 items)
INSERT INTO public.products (id, name, slug, description, category_id, base_price, sale_price, is_featured, is_best_seller, rating, rating_count, specs) VALUES
(
    'prod-1',
    'The Always Pan',
    'the-always-pan',
    'Designed to replace 8 traditional pieces of cookware, The Always Pan braises, sears, steams, strains, sautes, fries, boils, and serves. Featuring an ultra-durable, non-toxic ceramic non-stick coating engineered for effortless food release and cleanup. Comes with a modular steam-release lid, custom stainless steel steamer basket, and nesting beechwood spatula.',
    'pots-pans',
    45000.00,
    38000.00,
    true,
    true,
    4.9,
    142,
    '{"Material": "Ceramic Non-Stick & Cast Aluminum", "Diameter": "28 cm / 10 in", "Capacity": "2.6 Liters", "Includes": "Modular lid, steamer basket, beechwood spatula", "Stovetop": "Gas, Electric, Induction", "Care": "Hand wash recommended"}'::jsonb
),
(
    'prod-2',
    'Cast Iron Skillet',
    'cast-iron-skillet',
    'Pre-seasoned with 100% natural vegetable oil, this heavy-duty cast iron skillet delivers unmatched heat retention and uniform cooking across all heat sources. Ideal for searing steaks, browning stew meats, frying plantains, or baking golden skillet cornbread. Compatible with induction, gas, campfire, and oven up to 260°C.',
    'pots-pans',
    28000.00,
    NULL,
    false,
    true,
    4.8,
    98,
    '{"Material": "Heavy-duty Pre-seasoned Cast Iron", "Diameter": "26 cm / 10.25 in", "Heat Tolerance": "Up to 260°C (500°F)", "Compatibility": "Induction, Gas, Campfire, Oven", "Care": "Hand wash with warm water, dry immediately, oil lightly"}'::jsonb
),
(
    'prod-3',
    'Stainless Steel Pot Set',
    'stainless-steel-pot-set',
    'Professional-grade 3-ply clad stainless steel cookware set engineered for intense, even heat conduction without hot spots. Includes a 6L stockpot, 3L saucepan, and 26cm deep saute pan with snug tempered glass lids. Features cool-grip riveted handles and laser-etched interior capacity markings perfect for hearty Nigerian soups and celebration jollof.',
    'pots-pans',
    65000.00,
    55000.00,
    false,
    true,
    4.7,
    76,
    '{"Material": "3-Ply Clad Stainless Steel with Aluminum Core", "Pieces Included": "6L Stockpot, 3L Saucepan, 26cm Saute Pan + Tempered Glass Lids", "Handles": "Riveted Stay-Cool Stainless Steel", "Care": "Dishwasher safe"}'::jsonb
),
(
    'prod-4',
    'Professional Chef Knife',
    'professional-chef-knife',
    'Forged from premium high-carbon German steel with an ultra-fine 15-degree double-bevel cutting edge. Hand-finished for razor sharpness, outstanding edge retention, and corrosion resistance. The ergonomic curved bolster and balanced handle reduce wrist fatigue during extensive prep.',
    'knives',
    22000.00,
    NULL,
    false,
    true,
    4.9,
    115,
    '{"Blade Material": "High-Carbon German Steel (X50CrMoV15)", "Blade Length": "8 inches / 20 cm", "Edge Angle": "15 degrees double-bevel", "Handle": "Ergonomic Walnut / Composite", "Care": "Hand wash and dry immediately"}'::jsonb
),
(
    'prod-5',
    'Knife Block Set 5pc',
    'knife-block-set-5pc',
    'A comprehensive culinary cutlery set including an 8" Chef Knife, 8" Bread Knife, 7" Santoku, 5" Utility Knife, and 3.5" Paring Knife. Housed in a streamlined solid wood storage block designed to save counter space while safely displaying each piece. Full-tang construction provides durability and balance.',
    'knives',
    48000.00,
    42000.00,
    false,
    true,
    4.8,
    64,
    '{"Pieces": "8\" Chef Knife, 8\" Bread Knife, 7\" Santoku, 5\" Utility Knife, 3.5\" Paring Knife", "Block Material": "Solid Natural Hardwood", "Blade Construction": "Full-tang forged high-carbon steel", "Care": "Hand wash knives, wipe block clean"}'::jsonb
),
(
    'prod-6',
    'Digital Rice Cooker',
    'digital-rice-cooker',
    'Smart microcomputer rice cooker equipped with intelligent 3D induction heating and precision sensors that calculate temperature curves for perfectly fluffy rice every time. Includes pre-programmed settings for white rice, basmati, brown rice, slow cook, steam, and keep-warm. Non-stick ceramic inner bowl makes clean-up effortless.',
    'appliances',
    35000.00,
    NULL,
    false,
    true,
    4.6,
    83,
    '{"Capacity": "1.8 Liters (Up to 10 cups cooked)", "Inner Pot": "Non-stick ceramic inner bowl", "Heating": "Intelligent 3D Induction", "Functions": "White Rice, Basmati, Brown Rice, Slow Cook, Steam, Keep-Warm", "Power": "700W, 220-240V"}'::jsonb
),
(
    'prod-7',
    'Ceramic Dinner Set 16pc',
    'ceramic-dinner-set-16pc',
    'Modern 16-piece stoneware service for 4 persons, comprising 4 dinner plates (27cm), 4 salad plates (21cm), 4 cereal/soup bowls (15cm), and 4 artisanal mugs (350ml). Hand-finished with a durable, scratch-resistant matte glaze in warm earthy tones. Microwave, oven, freezer, and dishwasher safe.',
    'tableware',
    52000.00,
    45000.00,
    false,
    true,
    4.7,
    59,
    '{"Service For": "4 Persons (16 pieces total)", "Includes": "4x 27cm Dinner Plates, 4x 21cm Salad Plates, 4x 15cm Bowls, 4x 350ml Artisanal Mugs", "Material": "Durable Stoneware with Matte Glaze", "Care": "Microwave, Oven, Freezer, and Dishwasher Safe"}'::jsonb
),
(
    'prod-8',
    'Bamboo Utensil Set',
    'bamboo-utensil-set',
    'Handcrafted from 100% sustainable organic Moso bamboo, this 6-piece kitchen tool set brings natural elegance to cooking. Includes a solid spoon, slotted spoon, Turner spatula, slotted spatula, single-hole mixing spoon, and cylindrical utensil crock. Won’t scratch cookware coatings or absorb pungent odors.',
    'utensils',
    12000.00,
    NULL,
    false,
    false,
    4.5,
    42,
    '{"Pieces": "6 Pieces: Solid spoon, Slotted spoon, Turner, Slotted spatula, Single-hole mixing spoon, Cylinder crock", "Material": "100% Organic Moso Bamboo", "Features": "Non-scratch, odor-resistant", "Care": "Hand wash with mild soap"}'::jsonb
),
(
    'prod-9',
    'Glass Tumbler Set 6pc',
    'glass-tumbler-set-6pc',
    'Set of 6 textured borosilicate glassware tumblers featuring delicate fluted ridges and solid, weighted bases. Highly resistant to thermal shock, making them suitable for both chilled iced tea, hibiscus zobo, fresh citrus juice, and hot coffee drinks. Dishwasher safe and stackable.',
    'tableware',
    18000.00,
    15000.00,
    false,
    false,
    4.6,
    37,
    '{"Pieces": "Set of 6 Fluted Tumblers", "Capacity": "350ml each", "Material": "Borosilicate Glass", "Thermal Shock Resistance": "Safe from -20°C to 150°C", "Care": "Dishwasher safe and stackable"}'::jsonb
),
(
    'prod-10',
    'Non-Stick Baking Sheet',
    'non-stick-baking-sheet',
    'Commercial-weight aluminized steel half-sheet pan with reinforced encapsulated steel rim wires that resist warping under high temperatures up to 230°C. Unique micro-corrugated surface promotes even air circulation for consistent browning and baking. Coated with food-safe PFOA-free non-stick silicone for swift release.',
    'baking',
    14000.00,
    NULL,
    false,
    false,
    4.4,
    28,
    '{"Size": "Half-sheet (45 x 33 cm / 18 x 13 in)", "Material": "Commercial-weight aluminized steel", "Coating": "Food-safe PFOA-free non-stick silicone", "Max Temperature": "230°C (450°F)", "Care": "Hand wash recommended"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    base_price = EXCLUDED.base_price,
    sale_price = EXCLUDED.sale_price,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    rating = EXCLUDED.rating,
    rating_count = EXCLUDED.rating_count,
    specs = EXCLUDED.specs;

-- 3. PRODUCT_VARIANTS (19 items)
INSERT INTO public.product_variants (id, product_id, name, color_hex, sku, price, stock_quantity, display_order) VALUES
('var-1-1', 'prod-1', 'Sage', '#87907D', 'JK-PAN-SAGE', 38000.00, 50, 1),
('var-1-2', 'prod-1', 'Cream', '#F5F0E8', 'JK-PAN-CREAM', 38000.00, 50, 2),
('var-1-3', 'prod-1', 'Charcoal', '#36454F', 'JK-PAN-CHARCOAL', 38000.00, 50, 3),
('var-2-1', 'prod-2', 'Matte Black', '#1A1A1A', 'JK-SKILLET-BLACK', 28000.00, 50, 1),
('var-2-2', 'prod-2', 'Red Enamel', '#C62828', 'JK-SKILLET-RED', 28000.00, 50, 2),
('var-3-1', 'prod-3', 'Silver', '#C0C0C0', 'JK-POT-SILVER', 55000.00, 50, 1),
('var-3-2', 'prod-3', 'Copper', '#B87333', 'JK-POT-COPPER', 55000.00, 50, 2),
('var-4-1', 'prod-4', 'Walnut Handle', '#5C4033', 'JK-KNIFE-WALNUT', 22000.00, 50, 1),
('var-4-2', 'prod-4', 'Black', '#1A1A1A', 'JK-KNIFE-BLACK', 22000.00, 50, 2),
('var-5-1', 'prod-5', 'Natural', '#D4B896', 'JK-BLOCK-NATURAL', 42000.00, 50, 1),
('var-5-2', 'prod-5', 'Dark Oak', '#3E2723', 'JK-BLOCK-OAK', 42000.00, 50, 2),
('var-6-1', 'prod-6', 'White', '#FFFFFF', 'JK-RICE-WHITE', 35000.00, 50, 1),
('var-6-2', 'prod-6', 'Gray', '#808080', 'JK-RICE-GRAY', 35000.00, 50, 2),
('var-7-1', 'prod-7', 'Cream', '#F5F0E8', 'JK-DINNER-CREAM', 45000.00, 50, 1),
('var-7-2', 'prod-7', 'Sage', '#87907D', 'JK-DINNER-SAGE', 45000.00, 50, 2),
('var-8-1', 'prod-8', 'Natural', '#D4B896', 'JK-BAMBOO-NATURAL', 12000.00, 50, 1),
('var-9-1', 'prod-9', 'Clear', '#E8E8E8', 'JK-GLASS-CLEAR', 15000.00, 50, 1),
('var-9-2', 'prod-9', 'Sage Green', '#87907D', 'JK-GLASS-SAGE', 15000.00, 50, 2),
('var-10-1', 'prod-10', 'Gray', '#808080', 'JK-BAKE-GRAY', 14000.00, 50, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    color_hex = EXCLUDED.color_hex,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    display_order = EXCLUDED.display_order;

-- 4. PRODUCT_IMAGES (20 items)
-- Note: img-10-2 references var-10-1 (verified variant)
INSERT INTO public.product_images (id, product_id, variant_id, url, alt, is_primary, display_order) VALUES
('img-1-1', 'prod-1', 'var-1-1', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80', 'The Always Pan in Sage finish on kitchen stovetop', true, 1),
('img-1-2', 'prod-1', 'var-1-2', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80', 'The Always Pan in Cream with modular lid and nesting spatula', false, 2),
('img-2-1', 'prod-2', 'var-2-1', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'Classic seasoned matte black cast iron skillet', true, 1),
('img-2-2', 'prod-2', 'var-2-2', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80', 'Cast iron skillet cooking delicious meal on stovetop', false, 2),
('img-3-1', 'prod-3', 'var-3-1', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80', 'Mirror-polished stainless steel pot set collection', true, 1),
('img-3-2', 'prod-3', 'var-3-2', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', 'Stainless steel saucepan simmering on cooktop', false, 2),
('img-4-1', 'prod-4', 'var-4-1', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80', 'Professional chef knife with walnut handle on wood cutting board', true, 1),
('img-4-2', 'prod-4', 'var-4-2', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80', 'Chef knife razor blade detail alongside fresh ingredients', false, 2),
('img-5-1', 'prod-5', 'var-5-1', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80', 'Complete 5-piece knife block set standing on modern kitchen counter', true, 1),
('img-5-2', 'prod-5', 'var-5-2', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80', 'Assorted precision knives from block set ready for food prep', false, 2),
('img-6-1', 'prod-6', 'var-6-1', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80', 'Sleek digital rice cooker appliance on kitchen worktop', true, 1),
('img-6-2', 'prod-6', 'var-6-2', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80', 'Digital rice cooker display controls and sleek lid finish', false, 2),
('img-7-1', 'prod-7', 'var-7-1', 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=800&auto=format&fit=crop&q=80', '16-piece artisan ceramic tableware set neatly stacked on table', true, 1),
('img-7-2', 'prod-7', 'var-7-2', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80', 'Ceramic dinner plate and bowl setting with natural linen napkin', false, 2),
('img-8-1', 'prod-8', 'var-8-1', 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&auto=format&fit=crop&q=80', 'Organic bamboo utensil collection in matching holder', true, 1),
('img-8-2', 'prod-8', 'var-8-1', 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=800&auto=format&fit=crop&q=80', 'Smooth finished bamboo wooden spoons and turners', false, 2),
('img-9-1', 'prod-9', 'var-9-1', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80', 'Set of 6 fluted glass tumblers reflecting ambient light', true, 1),
('img-9-2', 'prod-9', 'var-9-2', 'https://images.unsplash.com/photo-1548602088-9d12a4f9c10f?w=800&auto=format&fit=crop&q=80', 'Fluted glass tumbler served with fresh drink and citrus garnish', false, 2),
('img-10-1', 'prod-10', 'var-10-1', 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80', 'Heavy-gauge non-stick rimmed baking sheet on marble counter', true, 1),
('img-10-2', 'prod-10', 'var-10-1', 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80', 'Freshly baked pastries on baking sheet with even golden finish', false, 2)
ON CONFLICT (id) DO UPDATE SET
    url = EXCLUDED.url,
    alt = EXCLUDED.alt,
    is_primary = EXCLUDED.is_primary,
    display_order = EXCLUDED.display_order;

-- 5. PROMOS (1 item)
INSERT INTO public.promos (id, title, subtitle, discount_text, code, end_date, bg_color, is_active) VALUES
(
    'promo-1',
    'Limited Time Offer',
    'Get 20% off all cast iron cookware this season',
    'Use code: JIREL20',
    'JIREL20',
    '2026-10-15T23:59:59Z',
    '#3D5449',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    discount_text = EXCLUDED.discount_text,
    code = EXCLUDED.code,
    end_date = EXCLUDED.end_date,
    bg_color = EXCLUDED.bg_color,
    is_active = EXCLUDED.is_active;

COMMIT;

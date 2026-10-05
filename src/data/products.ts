export interface ProductVariant {
  id: string;
  name: string;
  colorHex: string;
}

export interface ProductImage {
  id: string;
  variantId?: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  ratingCount: number;
  specs?: Record<string, string>;
  variants: ProductVariant[];
  images: ProductImage[];
}

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'The Always Pan',
    slug: 'the-always-pan',
    description:
      'Designed to replace 8 traditional pieces of cookware, The Always Pan braises, sears, steams, strains, sautes, fries, boils, and serves. Featuring an ultra-durable, non-toxic ceramic non-stick coating engineered for effortless food release and cleanup. Comes with a modular steam-release lid, custom stainless steel steamer basket, and nesting beechwood spatula.',
    categoryId: 'pots-pans',
    basePrice: 45000,
    salePrice: 38000,
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    ratingCount: 142,
    variants: [
      { id: 'var-1-1', name: 'Sage', colorHex: '#87907D' },
      { id: 'var-1-2', name: 'Cream', colorHex: '#F5F0E8' },
      { id: 'var-1-3', name: 'Charcoal', colorHex: '#36454F' },
    ],
    images: [
      {
        id: 'img-1-1',
        variantId: 'var-1-1',
        url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80',
        alt: 'The Always Pan in Sage finish on kitchen stovetop',
        isPrimary: true,
      },
      {
        id: 'img-1-2',
        variantId: 'var-1-2',
        url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80',
        alt: 'The Always Pan in Cream with modular lid and nesting spatula',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Cast Iron Skillet',
    slug: 'cast-iron-skillet',
    description:
      'Pre-seasoned with 100% natural vegetable oil, this heavy-duty cast iron skillet delivers unmatched heat retention and uniform cooking across all heat sources. Ideal for searing steaks, browning stew meats, frying plantains, or baking golden skillet cornbread. Compatible with induction, gas, campfire, and oven up to 260°C.',
    categoryId: 'pots-pans',
    basePrice: 28000,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.8,
    ratingCount: 98,
    variants: [
      { id: 'var-2-1', name: 'Matte Black', colorHex: '#1A1A1A' },
      { id: 'var-2-2', name: 'Red Enamel', colorHex: '#C62828' },
    ],
    images: [
      {
        id: 'img-2-1',
        variantId: 'var-2-1',
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
        alt: 'Classic seasoned matte black cast iron skillet',
        isPrimary: true,
      },
      {
        id: 'img-2-2',
        variantId: 'var-2-2',
        url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80',
        alt: 'Cast iron skillet cooking delicious meal on stovetop',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Stainless Steel Pot Set',
    slug: 'stainless-steel-pot-set',
    description:
      'Professional-grade 3-ply clad stainless steel cookware set engineered for intense, even heat conduction without hot spots. Includes a 6L stockpot, 3L saucepan, and 26cm deep saute pan with snug tempered glass lids. Features cool-grip riveted handles and laser-etched interior capacity markings perfect for hearty Nigerian soups and celebration jollof.',
    categoryId: 'pots-pans',
    basePrice: 65000,
    salePrice: 55000,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.7,
    ratingCount: 76,
    variants: [
      { id: 'var-3-1', name: 'Silver', colorHex: '#C0C0C0' },
      { id: 'var-3-2', name: 'Copper', colorHex: '#B87333' },
    ],
    images: [
      {
        id: 'img-3-1',
        variantId: 'var-3-1',
        url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
        alt: 'Mirror-polished stainless steel pot set collection',
        isPrimary: true,
      },
      {
        id: 'img-3-2',
        variantId: 'var-3-2',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
        alt: 'Stainless steel saucepan simmering on cooktop',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-4',
    name: 'Professional Chef Knife',
    slug: 'professional-chef-knife',
    description:
      'Forged from premium high-carbon German steel with an ultra-fine 15-degree double-bevel cutting edge. Hand-finished for razor sharpness, outstanding edge retention, and corrosion resistance. The ergonomic curved bolster and balanced handle reduce wrist fatigue during extensive prep.',
    categoryId: 'knives',
    basePrice: 22000,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.9,
    ratingCount: 115,
    variants: [
      { id: 'var-4-1', name: 'Walnut Handle', colorHex: '#5C4033' },
      { id: 'var-4-2', name: 'Black', colorHex: '#1A1A1A' },
    ],
    images: [
      {
        id: 'img-4-1',
        variantId: 'var-4-1',
        url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80',
        alt: 'Professional chef knife with walnut handle on wood cutting board',
        isPrimary: true,
      },
      {
        id: 'img-4-2',
        variantId: 'var-4-2',
        url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
        alt: 'Chef knife razor blade detail alongside fresh ingredients',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-5',
    name: 'Knife Block Set 5pc',
    slug: 'knife-block-set-5pc',
    description:
      'A comprehensive culinary cutlery set including an 8" Chef Knife, 8" Bread Knife, 7" Santoku, 5" Utility Knife, and 3.5" Paring Knife. Housed in a streamlined solid wood storage block designed to save counter space while safely displaying each piece. Full-tang construction provides durability and balance.',
    categoryId: 'knives',
    basePrice: 48000,
    salePrice: 42000,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.8,
    ratingCount: 64,
    variants: [
      { id: 'var-5-1', name: 'Natural', colorHex: '#D4B896' },
      { id: 'var-5-2', name: 'Dark Oak', colorHex: '#3E2723' },
    ],
    images: [
      {
        id: 'img-5-1',
        variantId: 'var-5-1',
        url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
        alt: 'Complete 5-piece knife block set standing on modern kitchen counter',
        isPrimary: true,
      },
      {
        id: 'img-5-2',
        variantId: 'var-5-2',
        url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80',
        alt: 'Assorted precision knives from block set ready for food prep',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-6',
    name: 'Digital Rice Cooker',
    slug: 'digital-rice-cooker',
    description:
      'Smart microcomputer rice cooker equipped with intelligent 3D induction heating and precision sensors that calculate temperature curves for perfectly fluffy rice every time. Includes pre-programmed settings for white rice, basmati, brown rice, slow cook, steam, and keep-warm. Non-stick ceramic inner bowl makes clean-up effortless.',
    categoryId: 'appliances',
    basePrice: 35000,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.6,
    ratingCount: 83,
    variants: [
      { id: 'var-6-1', name: 'White', colorHex: '#FFFFFF' },
      { id: 'var-6-2', name: 'Gray', colorHex: '#808080' },
    ],
    images: [
      {
        id: 'img-6-1',
        variantId: 'var-6-1',
        url: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80',
        alt: 'Sleek digital rice cooker appliance on kitchen worktop',
        isPrimary: true,
      },
      {
        id: 'img-6-2',
        variantId: 'var-6-2',
        url: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80',
        alt: 'Digital rice cooker display controls and sleek lid finish',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-7',
    name: 'Ceramic Dinner Set 16pc',
    slug: 'ceramic-dinner-set-16pc',
    description:
      'Modern 16-piece stoneware service for 4 persons, comprising 4 dinner plates (27cm), 4 salad plates (21cm), 4 cereal/soup bowls (15cm), and 4 artisanal mugs (350ml). Hand-finished with a durable, scratch-resistant matte glaze in warm earthy tones. Microwave, oven, freezer, and dishwasher safe.',
    categoryId: 'tableware',
    basePrice: 52000,
    salePrice: 45000,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.7,
    ratingCount: 59,
    variants: [
      { id: 'var-7-1', name: 'Cream', colorHex: '#F5F0E8' },
      { id: 'var-7-2', name: 'Sage', colorHex: '#87907D' },
    ],
    images: [
      {
        id: 'img-7-1',
        variantId: 'var-7-1',
        url: 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=800&auto=format&fit=crop&q=80',
        alt: '16-piece artisan ceramic tableware set neatly stacked on table',
        isPrimary: true,
      },
      {
        id: 'img-7-2',
        variantId: 'var-7-2',
        url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
        alt: 'Ceramic dinner plate and bowl setting with natural linen napkin',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-8',
    name: 'Bamboo Utensil Set',
    slug: 'bamboo-utensil-set',
    description:
      'Handcrafted from 100% sustainable organic Moso bamboo, this 6-piece kitchen tool set brings natural elegance to cooking. Includes a solid spoon, slotted spoon, Turner spatula, slotted spatula, single-hole mixing spoon, and cylindrical utensil crock. Won’t scratch cookware coatings or absorb pungent odors.',
    categoryId: 'utensils',
    basePrice: 12000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.5,
    ratingCount: 42,
    variants: [
      { id: 'var-8-1', name: 'Natural', colorHex: '#D4B896' },
    ],
    images: [
      {
        id: 'img-8-1',
        variantId: 'var-8-1',
        url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&auto=format&fit=crop&q=80',
        alt: 'Organic bamboo utensil collection in matching holder',
        isPrimary: true,
      },
      {
        id: 'img-8-2',
        variantId: 'var-8-1',
        url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=800&auto=format&fit=crop&q=80',
        alt: 'Smooth finished bamboo wooden spoons and turners',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-9',
    name: 'Glass Tumbler Set 6pc',
    slug: 'glass-tumbler-set-6pc',
    description:
      'Set of 6 textured borosilicate glassware tumblers featuring delicate fluted ridges and solid, weighted bases. Highly resistant to thermal shock, making them suitable for both chilled iced tea, hibiscus zobo, fresh citrus juice, and hot coffee drinks. Dishwasher safe and stackable.',
    categoryId: 'tableware',
    basePrice: 18000,
    salePrice: 15000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.6,
    ratingCount: 37,
    variants: [
      { id: 'var-9-1', name: 'Clear', colorHex: '#E8E8E8' },
      { id: 'var-9-2', name: 'Sage Green', colorHex: '#87907D' },
    ],
    images: [
      {
        id: 'img-9-1',
        variantId: 'var-9-1',
        url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
        alt: 'Set of 6 fluted glass tumblers reflecting ambient light',
        isPrimary: true,
      },
      {
        id: 'img-9-2',
        variantId: 'var-9-2',
        url: 'https://images.unsplash.com/photo-1548602088-9d12a4f9c10f?w=800&auto=format&fit=crop&q=80',
        alt: 'Fluted glass tumbler served with fresh drink and citrus garnish',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-10',
    name: 'Non-Stick Baking Sheet',
    slug: 'non-stick-baking-sheet',
    description:
      'Commercial-weight aluminized steel half-sheet pan with reinforced encapsulated steel rim wires that resist warping under high temperatures up to 230°C. Unique micro-corrugated surface promotes even air circulation for consistent browning and baking. Coated with food-safe PFOA-free non-stick silicone for swift release.',
    categoryId: 'baking',
    basePrice: 14000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.4,
    ratingCount: 28,
    variants: [
      { id: 'var-10-1', name: 'Gray', colorHex: '#808080' },
    ],
    images: [
      {
        id: 'img-10-1',
        variantId: 'var-10-1',
        url: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        alt: 'Heavy-gauge non-stick rimmed baking sheet on marble counter',
        isPrimary: true,
      },
      {
        id: 'img-10-2',
        variantId: 'var-10-1',
        url: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        alt: 'Freshly baked pastries on baking sheet with even golden finish',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'ingest-ceramic-dish-set-including-the',
    name: 'Ceramic Dish Set Including The Tray',
    slug: 'ceramic-dish-set-including-the',
    description:
      'Crafted for daily culinary elegance, this ceramic dish set including the tray combines durable materials with timeless tabletop aesthetics suitable for modern Nigerian kitchens.',
    categoryId: 'baking',
    basePrice: 12000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.8,
    ratingCount: 16,
    variants: [
      { id: 'var-ceramic-dish-set-including-the-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-ceramic-dish-set-including-the-1',
        variantId: 'var-ceramic-dish-set-including-the-1',
        url: '/images/products/ceramic-dish-set-including-the.webp',
        alt: 'Ceramic Dish Set Including The Tray presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'ingest-set-3-wooden-tray',
    name: 'Set 3 Wooden Tray',
    slug: 'set-3-wooden-tray',
    description:
      'Crafted for daily culinary elegance, this set 3 wooden tray combines durable materials with timeless tabletop aesthetics suitable for modern Nigerian kitchens.',
    categoryId: 'tableware',
    basePrice: 22000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.8,
    ratingCount: 16,
    variants: [
      { id: 'var-set-3-wooden-tray-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-set-3-wooden-tray-1',
        variantId: 'var-set-3-wooden-tray-1',
        url: '/images/products/set-3-wooden-tray.webp',
        alt: 'Set 3 Wooden Tray presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'ingest-16pcs---tea-cup--saucer-6cups',
    name: '16pcs - Tea Cup & Saucer 6cups 6saucer',
    slug: '16pcs---tea-cup--saucer-6cups',
    description:
      'Crafted for daily culinary elegance, this 16pcs - tea cup & saucer 6cups 6saucer combines durable materials with timeless tabletop aesthetics suitable for modern Nigerian kitchens.',
    categoryId: 'tableware',
    basePrice: 8500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.8,
    ratingCount: 16,
    variants: [
      { id: 'var-16pcs---tea-cup--saucer-6cups-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-16pcs---tea-cup--saucer-6cups-1',
        variantId: 'var-16pcs---tea-cup--saucer-6cups-1',
        url: '/images/products/16pcs---tea-cup--saucer-6cups.webp',
        alt: '16pcs - Tea Cup & Saucer 6cups 6saucer presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'ingest-ceramic-dish-set-with-tray',
    name: 'Ceramic Dish Set with Tray',
    slug: 'ceramic-dish-set-with-tray',
    description:
      'An elegant ceramic serving dish set designed for stylish presentation, complete with a convenient matching tray.',
    categoryId: 'tableware',
    basePrice: 12000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.8,
    ratingCount: 16,
    variants: [
      { id: 'var-ceramic-dish-set-with-tray-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-ceramic-dish-set-with-tray-1',
        variantId: 'var-ceramic-dish-set-with-tray-1',
        url: '/images/products/ceramic-dish-set-with-tray.webp',
        alt: 'Ceramic Dish Set with Tray presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'ingest-set-of-3-wooden-salad-bowls-an',
    name: 'Set of 3 Wooden Salad Bowls and Trays',
    slug: 'set-of-3-wooden-salad-bowls-an',
    description:
      'Crafted from natural wood, these durable and elegant wooden bowls are perfect for serving salads, poke bowls, and appetizers. Add a rustic charm to your dining experience with this premium tableware set.',
    categoryId: 'tableware',
    basePrice: 22000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.8,
    ratingCount: 16,
    variants: [
      { id: 'var-set-of-3-wooden-salad-bowls-an-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-set-of-3-wooden-salad-bowls-an-1',
        variantId: 'var-set-of-3-wooden-salad-bowls-an-1',
        url: '/images/products/set-of-3-wooden-salad-bowls-an.webp',
        alt: 'Set of 3 Wooden Salad Bowls and Trays presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'ingest-16-piece-ceramic-tea-cup-and-s',
    name: '16-Piece Ceramic Tea Cup and Saucer Dinnerware Set',
    slug: '16-piece-ceramic-tea-cup-and-s',
    description:
      'Elegant organic-edged ceramic tableware set featuring beautiful rustic finishes. Perfect for stylish dining presentation and everyday use.',
    categoryId: 'tableware',
    basePrice: 8500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.8,
    ratingCount: 16,
    variants: [
      { id: 'var-16-piece-ceramic-tea-cup-and-s-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-16-piece-ceramic-tea-cup-and-s-1',
        variantId: 'var-16-piece-ceramic-tea-cup-and-s-1',
        url: '/images/products/16-piece-ceramic-tea-cup-and-s.webp',
        alt: '16-Piece Ceramic Tea Cup and Saucer Dinnerware Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-1',
    name: '16-Piece Matte Ceramic Dinnerware Set',
    slug: '16-piece-matte-ceramic-dinnerware-s-1',
    description:
      'Crafted from high-quality, durable ceramic, this elegant 16-piece dinnerware set features a modern matte ribbed design. Ideal for everyday dining or special occasions, it is both microwave and dishwasher safe for convenient use.',
    categoryId: 'tableware',
    basePrice: 55000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-16-piece-matte-ceramic-dinnerware-s-1-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-16-piece-matte-ceramic-dinnerware-s-1-1',
        variantId: 'var-16-piece-matte-ceramic-dinnerware-s-1-1',
        url: '/images/products/16-piece-matte-ceramic-dinnerware-s-1.webp',
        alt: '16-Piece Matte Ceramic Dinnerware Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-2',
    name: 'Stainless Steel Vacuum Insulated Thermal Water Bottle',
    slug: 'stainless-steel-vacuum-insulated-th-2',
    description:
      'Crafted from premium stainless steel with advanced vacuum insulation, this bottle keeps your beverages hot or cold for hours. Designed with a leakproof cap, it is durable and easy to clean for daily use.',
    categoryId: 'tableware',
    basePrice: 7500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-stainless-steel-vacuum-insulated-th-2-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-stainless-steel-vacuum-insulated-th-2-1',
        variantId: 'var-stainless-steel-vacuum-insulated-th-2-1',
        url: '/images/products/stainless-steel-vacuum-insulated-th-2.webp',
        alt: 'Stainless Steel Vacuum Insulated Thermal Water Bottle presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-3',
    name: 'Ceramic Dish and Serving Tray Set',
    slug: 'ceramic-dish-and-serving-tray-set-3',
    description:
      'This elegant ceramic dish set includes lidded bowls and a cup beautifully presented on a sleek matching serving tray. Perfect for serving hot soups or side dishes, these pieces are durable, heat-resistant, and easy to clean.',
    categoryId: 'tableware',
    basePrice: 12000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-ceramic-dish-and-serving-tray-set-3-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-ceramic-dish-and-serving-tray-set-3-1',
        variantId: 'var-ceramic-dish-and-serving-tray-set-3-1',
        url: '/images/products/ceramic-dish-and-serving-tray-set-3.webp',
        alt: 'Ceramic Dish and Serving Tray Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-4',
    name: 'Set of 3 Nested Wooden Serving Trays',
    slug: 'set-of-3-nested-wooden-serving-tray-4',
    description:
      'Crafted from durable natural wood, these versatile nesting trays offer convenient storage and elegant serving options for your home. Built for daily use and easy maintenance, they combine functionality with rustic charm.',
    categoryId: 'tableware',
    basePrice: 22000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-set-of-3-nested-wooden-serving-tray-4-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-set-of-3-nested-wooden-serving-tray-4-1',
        variantId: 'var-set-of-3-nested-wooden-serving-tray-4-1',
        url: '/images/products/set-of-3-nested-wooden-serving-tray-4.webp',
        alt: 'Set of 3 Nested Wooden Serving Trays presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-5',
    name: '16-Piece Modern Grey Dinnerware Set',
    slug: '16-piece-modern-grey-dinnerware-set-5',
    description:
      'Elevate your dining experience with this sleek 16-piece modern grey tableware set, featuring durable plates, bowls, and mugs. Designed for daily use, these pieces are both dishwasher and microwave safe for your convenience.',
    categoryId: 'tableware',
    basePrice: 8500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-16-piece-modern-grey-dinnerware-set-5-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-16-piece-modern-grey-dinnerware-set-5-1',
        variantId: 'var-16-piece-modern-grey-dinnerware-set-5-1',
        url: '/images/products/16-piece-modern-grey-dinnerware-set-5.webp',
        alt: '16-Piece Modern Grey Dinnerware Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-6',
    name: '32-Piece Luxury Gold Tree Ceramic Dinner Set',
    slug: '32-piece-luxury-gold-tree-ceramic-d-6',
    description:
      'Exquisitely designed with elegant gold tree motifs and metallic gold rims, this ceramic dinner set brings high-end luxury to your dining table. Crafted from durable, premium-grade ceramic, it is perfect for serving multi-course meals and requires gentle hand washing to preserve its luster.',
    categoryId: 'tableware',
    basePrice: 65000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-32-piece-luxury-gold-tree-ceramic-d-6-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-32-piece-luxury-gold-tree-ceramic-d-6-1',
        variantId: 'var-32-piece-luxury-gold-tree-ceramic-d-6-1',
        url: '/images/products/32-piece-luxury-gold-tree-ceramic-d-6.webp',
        alt: '32-Piece Luxury Gold Tree Ceramic Dinner Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-7',
    name: 'Luxury Ceramic Serving Bowl with Gold Rim Edge',
    slug: 'luxury-ceramic-serving-bowl-with-go-7',
    description:
      'This elegant ceramic serving bowl features a stunning gold rim edge designed to elevate your dining table presentation. Crafted from high-quality, durable ceramic, it is perfect for serving delicious meals and should be hand-washed gently to maintain its luxurious gold finish.',
    categoryId: 'tableware',
    basePrice: 5500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-luxury-ceramic-serving-bowl-with-go-7-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-luxury-ceramic-serving-bowl-with-go-7-1',
        variantId: 'var-luxury-ceramic-serving-bowl-with-go-7-1',
        url: '/images/products/luxury-ceramic-serving-bowl-with-go-7.webp',
        alt: 'Luxury Ceramic Serving Bowl with Gold Rim Edge presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-8',
    name: '1200ml Stainless Steel Insulated Travel Tumbler with Handle and Straw',
    slug: '1200ml-stainless-steel-insulated-tr-8',
    description:
      'Crafted from premium double-walled stainless steel, this insulated travel tumbler keeps your beverages at the perfect temperature for hours. Designed with an ergonomic handle and reusable straw, it is durable, leak-resistant, and hand-wash recommended.',
    categoryId: 'tableware',
    basePrice: 8500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-1200ml-stainless-steel-insulated-tr-8-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-1200ml-stainless-steel-insulated-tr-8-1',
        variantId: 'var-1200ml-stainless-steel-insulated-tr-8-1',
        url: '/images/products/1200ml-stainless-steel-insulated-tr-8.webp',
        alt: '1200ml Stainless Steel Insulated Travel Tumbler with Handle and Straw presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-9',
    name: 'Stainless Steel Office Insulated Mug with Phone Holder',
    slug: 'stainless-steel-office-insulated-mu-9',
    description:
      'Crafted from durable food-grade stainless steel with a convenient lid and built-in phone holder for your daily workspace. Hand wash recommended to maintain the sleek insulated finish and longevity.',
    categoryId: 'tableware',
    basePrice: 5500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-stainless-steel-office-insulated-mu-9-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-stainless-steel-office-insulated-mu-9-1',
        variantId: 'var-stainless-steel-office-insulated-mu-9-1',
        url: '/images/products/stainless-steel-office-insulated-mu-9.webp',
        alt: 'Stainless Steel Office Insulated Mug with Phone Holder presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-10',
    name: '24-Piece Gold Stainless Steel Flatware Tableware Set',
    slug: '24-piece-gold-stainless-steel-flatw-10',
    description:
      'Crafted from premium gold-plated stainless steel, this 24-piece tableware set offers exceptional durability and a luxurious dining experience. Hand wash recommended to preserve the brilliant metallic finish.',
    categoryId: 'tableware',
    basePrice: 25000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-24-piece-gold-stainless-steel-flatw-10-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-24-piece-gold-stainless-steel-flatw-10-1',
        variantId: 'var-24-piece-gold-stainless-steel-flatw-10-1',
        url: '/images/products/24-piece-gold-stainless-steel-flatw-10.webp',
        alt: '24-Piece Gold Stainless Steel Flatware Tableware Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-11',
    name: 'Portable Glass Coffee Mug with Protective Sleeve and Handle',
    slug: 'portable-glass-coffee-mug-with-prot-11',
    description:
      'Crafted from durable food-grade glass encased in a protective outer shell, this versatile mug features a sturdy handle and secure screw-top lid. It is easy to wash by hand and perfect for keeping your tea, water, or coffee safe on the go.',
    categoryId: 'tableware',
    basePrice: 1800,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-portable-glass-coffee-mug-with-prot-11-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-portable-glass-coffee-mug-with-prot-11-1',
        variantId: 'var-portable-glass-coffee-mug-with-prot-11-1',
        url: '/images/products/portable-glass-coffee-mug-with-prot-11.webp',
        alt: 'Portable Glass Coffee Mug with Protective Sleeve and Handle presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-12',
    name: 'Luxury White Ceramic Dinner Plate with Gold Geometric Rim',
    slug: 'luxury-white-ceramic-dinner-plate-w-12',
    description:
      'Crafted from premium high-fired ceramic, this elegant dinner plate features a pristine glossy finish accented with a sophisticated gold geometric rim. Perfect for formal dining and special occasions, it should be gently hand-washed to protect and preserve its metallic detailing.',
    categoryId: 'tableware',
    basePrice: 5500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-luxury-white-ceramic-dinner-plate-w-12-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-luxury-white-ceramic-dinner-plate-w-12-1',
        variantId: 'var-luxury-white-ceramic-dinner-plate-w-12-1',
        url: '/images/products/luxury-white-ceramic-dinner-plate-w-12.webp',
        alt: 'Luxury White Ceramic Dinner Plate with Gold Geometric Rim presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-13',
    name: 'Ornate Gold-Rimmed Porcelain Dinner and Side Plate Set',
    slug: 'ornate-gold-rimmed-porcelain-dinner-13',
    description:
      'This elegant porcelain dinnerware features an exquisite embossed gold-scrolled rim that adds luxury to any table setting. Crafted from durable food-safe ceramic, these plates are perfect for both special occasions and daily dining.',
    categoryId: 'tableware',
    basePrice: 5000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-ornate-gold-rimmed-porcelain-dinner-13-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-ornate-gold-rimmed-porcelain-dinner-13-1',
        variantId: 'var-ornate-gold-rimmed-porcelain-dinner-13-1',
        url: '/images/products/ornate-gold-rimmed-porcelain-dinner-13.webp',
        alt: 'Ornate Gold-Rimmed Porcelain Dinner and Side Plate Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-14',
    name: 'Gold-Rimmed White Ceramic Dinner and Soup Plate Set',
    slug: 'gold-rimmed-white-ceramic-dinner-an-14',
    description:
      'Crafted from high-quality white ceramic with an elegant gold-rimmed design for a luxurious dining experience. Durable and easy to clean, perfect for both daily family meals and special occasions.',
    categoryId: 'tableware',
    basePrice: 5500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-gold-rimmed-white-ceramic-dinner-an-14-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-gold-rimmed-white-ceramic-dinner-an-14-1',
        variantId: 'var-gold-rimmed-white-ceramic-dinner-an-14-1',
        url: '/images/products/gold-rimmed-white-ceramic-dinner-an-14.webp',
        alt: 'Gold-Rimmed White Ceramic Dinner and Soup Plate Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-15',
    name: '2-Piece Clear Glass Mug Tumbler Set',
    slug: '2-piece-clear-glass-mug-tumbler-set-15',
    description:
      'Crafted from durable clear glass, this 2-piece tumbler set is designed for everyday use and elegant serving. It is easy to clean and dishwasher safe for your convenience.',
    categoryId: 'tableware',
    basePrice: 4000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-2-piece-clear-glass-mug-tumbler-set-15-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-2-piece-clear-glass-mug-tumbler-set-15-1',
        variantId: 'var-2-piece-clear-glass-mug-tumbler-set-15-1',
        url: '/images/products/2-piece-clear-glass-mug-tumbler-set-15.webp',
        alt: '2-Piece Clear Glass Mug Tumbler Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-16',
    name: 'G-Horse 6-Piece Clear Embossed Glass Tumbler Set 330ml',
    slug: 'g-horse-6-piece-clear-embossed-glas-16',
    description:
      'Crafted from high-quality clear glass with an elegant embossed diamond pattern for a comfortable grip. Durable and stylish, this 6-piece tumbler set is ideal for everyday use and effortless cleaning.',
    categoryId: 'tableware',
    basePrice: 6000,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-g-horse-6-piece-clear-embossed-glas-16-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-g-horse-6-piece-clear-embossed-glas-16-1',
        variantId: 'var-g-horse-6-piece-clear-embossed-glas-16-1',
        url: '/images/products/g-horse-6-piece-clear-embossed-glas-16.webp',
        alt: 'G-Horse 6-Piece Clear Embossed Glass Tumbler Set 330ml presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-17',
    name: '3-Piece Glitter Tumbler Set with Rainbow Dome Lids',
    slug: '3-piece-glitter-tumbler-set-with-ra-17',
    description:
      'Crafted from durable, food-grade BPA-free plastic, these vibrant glitter tumblers feature playful rainbow dome lids perfect for cold beverages. Hand washing with mild soap and a soft sponge is recommended to maintain the sparkling foil finish.',
    categoryId: 'tableware',
    basePrice: 2600,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-3-piece-glitter-tumbler-set-with-ra-17-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-3-piece-glitter-tumbler-set-with-ra-17-1',
        variantId: 'var-3-piece-glitter-tumbler-set-with-ra-17-1',
        url: '/images/products/3-piece-glitter-tumbler-set-with-ra-17.webp',
        alt: '3-Piece Glitter Tumbler Set with Rainbow Dome Lids presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-18',
    name: 'Gradient Frosted Motivational Sports Water Bottle Set',
    slug: 'gradient-frosted-motivational-sport-18',
    description:
      'Crafted from durable BPA-free frosted material, this vibrant motivational water bottle set features convenient silicone straws for easy hydration on the go. Designed for longevity, simply hand wash to preserve the smooth gradient finish and daily time markers.',
    categoryId: 'tableware',
    basePrice: 6500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-gradient-frosted-motivational-sport-18-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-gradient-frosted-motivational-sport-18-1',
        variantId: 'var-gradient-frosted-motivational-sport-18-1',
        url: '/images/products/gradient-frosted-motivational-sport-18.webp',
        alt: 'Gradient Frosted Motivational Sports Water Bottle Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-19',
    name: 'Stainless Steel Thermal Vacuum Travel Flask',
    slug: 'stainless-steel-thermal-vacuum-trav-19',
    description:
      'Crafted from durable food-grade stainless steel, this insulated travel flask keeps beverages hot or cold for hours on the go. Hand washing is recommended to maintain the vacuum seal and vibrant exterior finish.',
    categoryId: 'tableware',
    basePrice: 5500,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-stainless-steel-thermal-vacuum-trav-19-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-stainless-steel-thermal-vacuum-trav-19-1',
        variantId: 'var-stainless-steel-thermal-vacuum-trav-19-1',
        url: '/images/products/stainless-steel-thermal-vacuum-trav-19.webp',
        alt: 'Stainless Steel Thermal Vacuum Travel Flask presented on brand studio background',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'item-20',
    name: '12-Piece Blooming Glass Coffee Cup and Saucer Set',
    slug: '12-piece-blooming-glass-coffee-cup-20',
    description:
      'Crafted from durable, high-quality transparent glass featuring a charming ribbed design for everyday use or special occasions. Easy to clean and maintain, this stylish cup and saucer set adds elegance to your coffee serving experience.',
    categoryId: 'tableware',
    basePrice: 11250,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      { id: 'var-12-piece-blooming-glass-coffee-cup-20-1', name: 'Standard Studio', colorHex: '#FAF7F2' },
    ],
    images: [
      {
        id: 'img-12-piece-blooming-glass-coffee-cup-20-1',
        variantId: 'var-12-piece-blooming-glass-coffee-cup-20-1',
        url: '/images/products/12-piece-blooming-glass-coffee-cup-20.webp',
        alt: '12-Piece Blooming Glass Coffee Cup and Saucer Set presented on brand studio background',
        isPrimary: true,
      },
    ],
  },

];

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((product) => product.categoryId === categoryId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProduct(): Product | undefined {
  return products.find((product) => product.isFeatured);
}

export function getBestSellerProducts(): Product[] {
  return products.filter((product) => product.isBestSeller);
}

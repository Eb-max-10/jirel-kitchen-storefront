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

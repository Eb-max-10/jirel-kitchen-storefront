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
    id: 'item-1',
    name: '16-Piece Matte Ceramic Dinnerware Set',
    slug: '16-piece-matte-ceramic-dinnerware-s-1',
    description:
      'Crafted from high-quality, durable ceramic, this elegant 16-piece dinnerware set features a modern matte ribbed design. Ideal for everyday dining or special occasions, it is both microwave and dishwasher safe for convenient use.',
    categoryId: 'tableware',
    basePrice: 55000,
    isFeatured: true,
    isBestSeller: true,
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
    isBestSeller: true,
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
    isBestSeller: true,
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
    isBestSeller: true,
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
    isBestSeller: true,
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  displayOrder: number;
}

export const categories: Category[] = [
  {
    id: 'pots-pans',
    name: 'Pots & Pans',
    slug: 'pots-pans',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
    displayOrder: 1,
  },
  {
    id: 'knives',
    name: 'Knives',
    slug: 'knives',
    imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&auto=format&fit=crop&q=80',
    displayOrder: 2,
  },
  {
    id: 'utensils',
    name: 'Utensils',
    slug: 'utensils',
    imageUrl: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&auto=format&fit=crop&q=80',
    displayOrder: 3,
  },
  {
    id: 'tableware',
    name: 'Tableware',
    slug: 'tableware',
    imageUrl: 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=400&auto=format&fit=crop&q=80',
    displayOrder: 4,
  },
  {
    id: 'baking',
    name: 'Baking',
    slug: 'baking',
    imageUrl: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=400&auto=format&fit=crop&q=80',
    displayOrder: 5,
  },
  {
    id: 'appliances',
    name: 'Appliances',
    slug: 'appliances',
    imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=400&auto=format&fit=crop&q=80',
    displayOrder: 6,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

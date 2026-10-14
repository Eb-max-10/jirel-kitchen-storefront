export interface Promo {
  id: string;
  title: string;
  subtitle: string;
  discountText: string;
  endDate: string;
  bgColor: string;
  isActive: boolean;
}

export const activePromo: Promo = {
  id: 'promo-1',
  title: 'Curated Kitchenware',
  subtitle: 'Premium tableware and culinary essentials for your home',
  discountText: 'JIREL KITCHEN HUB',
  endDate: '2026-12-31T23:59:59Z',
  bgColor: '#3D5449',
  isActive: false,
};

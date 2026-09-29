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
  title: 'Limited Time Offer',
  subtitle: 'Get 20% off all cast iron cookware this season',
  discountText: 'Use code: JIREL20',
  endDate: '2026-10-15T23:59:59Z',
  bgColor: '#3D5449',
  isActive: true,
};

/** Format price in NGN with commas: 45000 → "₦45,000" */
export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/** Combine class names (lightweight clsx alternative) */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

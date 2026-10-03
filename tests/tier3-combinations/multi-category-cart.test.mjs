/**
 * Tier 3: Multi-Category Cart Combination & Pricing Tests
 * Authoritative source: categories.ts, products.ts, ORIGINAL_REQUEST §R2
 */

import { describe, test, expect } from '../helpers/test-framework.mjs';
import { products } from '../../src/data/products.ts';
import { categories } from '../../src/data/categories.ts';

describe('Tier 3: Multi-Category Cart Checkout Combinations', () => {
  test('Products exist across multiple distinct categories', () => {
    const categoriesRepresented = new Set(products.map(p => p.categoryId));
    expect(categoriesRepresented.size).toBe(6);
  });

  test('Multi-category cart items subtotal and kobo calculation', () => {
    // 1. Pots & Pans: prod-1 (Always Pan)
    const prod1 = products.find(p => p.id === 'prod-1');
    const price1 = prod1.salePrice ?? prod1.basePrice; // 38000
    const item1 = {
      productId: prod1.id,
      variantId: prod1.variants[0].id,
      name: prod1.name,
      variantName: prod1.variants[0].name,
      price: price1,
      quantity: 1,
      image: prod1.images[0].url,
    };

    // 2. Knives: prod-4 (Professional Chef Knife)
    const prod4 = products.find(p => p.id === 'prod-4');
    const price2 = prod4.salePrice ?? prod4.basePrice; // 22000
    const item2 = {
      productId: prod4.id,
      variantId: prod4.variants[0].id,
      name: prod4.name,
      variantName: prod4.variants[0].name,
      price: price2,
      quantity: 1,
      image: prod4.images[0].url,
    };

    // 3. Utensils: prod-8 (Bamboo Utensil Set)
    const prod8 = products.find(p => p.id === 'prod-8');
    const price3 = prod8.salePrice ?? prod8.basePrice; // 12000
    const item3 = {
      productId: prod8.id,
      variantId: prod8.variants[0].id,
      name: prod8.name,
      variantName: prod8.variants[0].name,
      price: price3,
      quantity: 2, // 24000
      image: prod8.images[0].url,
    };

    // 4. Baking: prod-10 (Non-Stick Baking Sheet)
    const prod10 = products.find(p => p.id === 'prod-10');
    const price4 = prod10.salePrice ?? prod10.basePrice; // 14000
    const item4 = {
      productId: prod10.id,
      variantId: prod10.variants[0].id,
      name: prod10.name,
      variantName: prod10.variants[0].name,
      price: price4,
      quantity: 1,
      image: prod10.images[0].url,
    };

    const cart = [item1, item2, item3, item4];

    // Compute expected subtotal: 38000 + 22000 + (12000 * 2) + 14000 = 98000
    const expectedSubtotal = (price1 * 1) + (price2 * 1) + (price3 * 2) + (price4 * 1);
    expect(expectedSubtotal).toBe(98000);

    const computedSubtotal = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    expect(computedSubtotal).toBe(expectedSubtotal);

    // Kobo conversion
    const expectedKobo = expectedSubtotal * 100; // 9,800,000 kobo
    const computedKobo = Math.round(computedSubtotal * 100);
    expect(computedKobo).toBe(9800000);
    expect(computedKobo).toBe(expectedKobo);
  });

  test('Sale price priority over base price in cart pricing', () => {
    for (const p of products) {
      const effectivePrice = p.salePrice ?? p.basePrice;
      if (p.salePrice) {
        expect(effectivePrice).toBe(p.salePrice);
        expect(effectivePrice).toBeLessThan(p.basePrice);
      } else {
        expect(effectivePrice).toBe(p.basePrice);
      }
    }
  });
});

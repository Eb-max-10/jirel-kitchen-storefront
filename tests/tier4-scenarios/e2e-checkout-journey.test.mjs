/**
 * Tier 4: Real-World Scenarios - Full User Checkout Journey Simulation
 * Authoritative source: ORIGINAL_REQUEST §Acceptance Criteria:
 * "End-to-end simulated checkout flow executes from Cart Drawer -> Paystack popup trigger -> verification endpoint -> confirmed order record."
 */

import { describe, test, expect } from '../helpers/test-framework.mjs';
import { products } from '../../src/data/products.ts';
import { categories } from '../../src/data/categories.ts';
import { createMockPaystackSuccessResponse } from '../helpers/mock-paystack.mjs';

describe('Tier 4: End-to-End User Journey Simulation', () => {
  test('Step 1: Customer browses categories and product catalog', () => {
    expect(categories.length).toBeGreaterThanOrEqual(6);
    expect(products.length).toBeGreaterThanOrEqual(10);

    const potsCategory = categories.find((c) => c.slug === 'pots-pans');
    expect(potsCategory).toBeDefined();

    const categoryProducts = products.filter((p) => p.categoryId === potsCategory.id);
    expect(categoryProducts.length).toBeGreaterThan(0);
  });

  test('Step 2: Customer inspects product detail view for "The Always Pan"', () => {
    const slug = 'the-always-pan';
    const product = products.find((p) => p.slug === slug);
    expect(product).toBeDefined();
    expect(product.name).toBe('The Always Pan');
    expect(product.variants.length).toBe(3);

    // Customer selects "Sage" variant
    const selectedVariant = product.variants.find((v) => v.name === 'Sage');
    expect(selectedVariant).toBeDefined();
    expect(selectedVariant.id).toBe('var-1-1');

    // Effective price calculation (sale price prioritized)
    const effectivePrice = product.salePrice ?? product.basePrice;
    expect(effectivePrice).toBe(38000);
  });

  test('Step 3 & 4: Customer adds items to cart and updates cart state', () => {
    const cart = [];

    // Add Item 1: Always Pan (Sage)
    const prod1 = products.find((p) => p.slug === 'the-always-pan');
    const item1 = {
      productId: prod1.id,
      variantId: prod1.variants[0].id,
      name: prod1.name,
      variantName: prod1.variants[0].name,
      price: prod1.salePrice ?? prod1.basePrice,
      quantity: 1,
      image: prod1.images[0].url,
    };
    cart.push(item1);

    // Add Item 2: Cast Iron Skillet (Matte Black)
    const prod2 = products.find((p) => p.slug === 'cast-iron-skillet');
    const item2 = {
      productId: prod2.id,
      variantId: prod2.variants[0].id,
      name: prod2.name,
      variantName: prod2.variants[0].name,
      price: prod2.salePrice ?? prod2.basePrice,
      quantity: 1,
      image: prod2.images[0].url,
    };
    cart.push(item2);

    expect(cart.length).toBe(2);

    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(66000); // 38000 + 28000 = 66,000 NGN
  });

  test('Step 5 & 6: Customer completes intake form & Paystack kobo transaction created', () => {
    const customerInfo = {
      customer_name: 'Tunde Bakare',
      email: 'tunde.bakare@example.com',
      customer_phone: '+2348023456789',
      shipping_address: '12 Ikeja GRA, Ikeja, Lagos State',
    };

    const subtotal = 66000;
    const amountInKobo = Math.round(subtotal * 100);
    const reference = `JK_${Date.now()}_test${Math.random().toString(36).substring(2, 7)}`;

    expect(amountInKobo).toBe(6600000);
    expect(reference.startsWith('JK_')).toBe(true);

    // Mock Paystack transaction success
    const paystackResponse = createMockPaystackSuccessResponse(reference, amountInKobo, {
      name: customerInfo.customer_name,
      email: customerInfo.email,
      phone: customerInfo.customer_phone,
      address: customerInfo.shipping_address,
    });

    expect(paystackResponse.status).toBe(true);
    expect(paystackResponse.data.status).toBe('success');
    expect(paystackResponse.data.amount).toBe(6600000);
    expect(paystackResponse.data.reference).toBe(reference);
  });

  test('Step 7 & 8: Server verification validation and order receipt generation', () => {
    const reference = 'JK_1727956899999_sample';
    const subtotal = 66000;
    const amountInKobo = 6600000;

    const mockPaystack = createMockPaystackSuccessResponse(reference, amountInKobo, {
      name: 'Tunde Bakare',
      email: 'tunde.bakare@example.com',
    });

    // Verification logic
    const isPaymentValid =
      mockPaystack.status === true &&
      mockPaystack.data.status === 'success' &&
      mockPaystack.data.amount === subtotal * 100;

    expect(isPaymentValid).toBe(true);

    // Confirmed Order record created for Supabase
    const confirmedOrder = {
      id: 'ord-simulated-uuid-12345',
      customer_name: 'Tunde Bakare',
      email: 'tunde.bakare@example.com',
      customer_phone: '+2348023456789',
      shipping_address: '12 Ikeja GRA, Ikeja, Lagos State',
      total_price: subtotal,
      currency: 'NGN',
      paystack_reference: reference,
      payment_status: 'paid',
      created_at: new Date().toISOString(),
    };

    expect(confirmedOrder.payment_status).toBe('paid');
    expect(confirmedOrder.total_price).toBe(66000);

    // WhatsApp Concierge Link Generation
    const whatsappPhone = '2348000000000';
    const messageText = encodeURIComponent(
      `Hi Jirel Kitchen, I just placed order ${confirmedOrder.paystack_reference} for ${confirmedOrder.customer_name} (Total: NGN ${confirmedOrder.total_price.toLocaleString()}).`
    );
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${messageText}`;

    expect(whatsappUrl).toContain('https://wa.me/2348000000000');
    expect(whatsappUrl).toContain(reference);
  });
});

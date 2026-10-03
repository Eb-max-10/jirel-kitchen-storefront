/**
 * Tier 2: API & Checkout Boundary and Corner Case Tests
 * Authoritative source: ORIGINAL_REQUEST §R2, PROJECT.md §Interface Contracts
 */

import { describe, test, expect } from '../helpers/test-framework.mjs';
import { isValidPaystackReference, createMockPaystackFailedResponse } from '../helpers/mock-paystack.mjs';

describe('Tier 2: Paystack Reference Validation & Adversarial Inputs', () => {
  test('Valid Paystack references pass validator', () => {
    expect(isValidPaystackReference('JK_1727956800000_abc123')).toBe(true);
    expect(isValidPaystackReference('JK_1727956899999_xyz9876')).toBe(true);
    expect(isValidPaystackReference('ref_standard_paystack_sample_3981')).toBe(true);
  });

  test('Empty or whitespace reference rejected', () => {
    expect(isValidPaystackReference('')).toBe(false);
    expect(isValidPaystackReference('   ')).toBe(false);
    expect(isValidPaystackReference(null)).toBe(false);
    expect(isValidPaystackReference(undefined)).toBe(false);
  });

  test('Adversarial / Malicious reference strings rejected or safely handled', () => {
    expect(isValidPaystackReference('../../etc/passwd')).toBe(false);
    expect(isValidPaystackReference('<script>alert(1)</script>')).toBe(false);
    expect(isValidPaystackReference("'; DROP TABLE orders; --")).toBe(false);
  });
});

describe('Tier 2: Order Data & Customer Boundary Conditions', () => {
  function validateOrderPayload(body) {
    if (!body || typeof body !== 'object') return { valid: false, error: 'Request body must be an object' };
    if (!body.reference || typeof body.reference !== 'string' || body.reference.trim() === '') {
      return { valid: false, error: 'Valid Paystack reference is required' };
    }
    const { orderData } = body;
    if (!orderData || typeof orderData !== 'object') {
      return { valid: false, error: 'orderData is required' };
    }
    if (!orderData.customer_name || typeof orderData.customer_name !== 'string' || !orderData.customer_name.trim()) {
      return { valid: false, error: 'Customer name is required' };
    }
    if (!orderData.email || typeof orderData.email !== 'string' || !orderData.email.includes('@')) {
      return { valid: false, error: 'Valid email address is required' };
    }
    if (!orderData.customer_phone || typeof orderData.customer_phone !== 'string' || !orderData.customer_phone.trim()) {
      return { valid: false, error: 'Customer phone number is required' };
    }
    if (!orderData.shipping_address || typeof orderData.shipping_address !== 'string' || !orderData.shipping_address.trim()) {
      return { valid: false, error: 'Shipping address is required' };
    }
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return { valid: false, error: 'Order must contain at least one item' };
    }
    if (typeof orderData.total_price !== 'number' || orderData.total_price <= 0 || isNaN(orderData.total_price)) {
      return { valid: false, error: 'Total price must be a positive number' };
    }

    // Verify calculated items total matches total_price
    const computedTotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(computedTotal - orderData.total_price) > 0.01) {
      return { valid: false, error: 'Total price does not match sum of items' };
    }

    return { valid: true };
  }

  test('Missing reference returns validation error', () => {
    const res = validateOrderPayload({ orderData: { customer_name: 'Jane' } });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('reference');
  });

  test('Missing customer_name returns validation error', () => {
    const res = validateOrderPayload({
      reference: 'JK_123_abc',
      orderData: { email: 'test@example.com', customer_phone: '+2348000000000', shipping_address: 'Lagos', items: [{ price: 100, quantity: 1 }], total_price: 100 },
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Customer name');
  });

  test('Malformed email format returns validation error', () => {
    const res = validateOrderPayload({
      reference: 'JK_123_abc',
      orderData: { customer_name: 'Jane', email: 'invalid-email-address', customer_phone: '+2348000000000', shipping_address: 'Lagos', items: [{ price: 100, quantity: 1 }], total_price: 100 },
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('email');
  });

  test('Empty items array returns validation error', () => {
    const res = validateOrderPayload({
      reference: 'JK_123_abc',
      orderData: { customer_name: 'Jane', email: 'jane@example.com', customer_phone: '+2348000000000', shipping_address: 'Lagos', items: [], total_price: 100 },
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('at least one item');
  });

  test('Zero or negative total price rejected', () => {
    const zeroRes = validateOrderPayload({
      reference: 'JK_123_abc',
      orderData: { customer_name: 'Jane', email: 'jane@example.com', customer_phone: '+2348000000000', shipping_address: 'Lagos', items: [{ price: 0, quantity: 1 }], total_price: 0 },
    });
    expect(zeroRes.valid).toBe(false);

    const negRes = validateOrderPayload({
      reference: 'JK_123_abc',
      orderData: { customer_name: 'Jane', email: 'jane@example.com', customer_phone: '+2348000000000', shipping_address: 'Lagos', items: [{ price: -500, quantity: 1 }], total_price: -500 },
    });
    expect(negRes.valid).toBe(false);
  });

  test('Tampered total_price (client-side price manipulation) rejected', () => {
    // Customer attempted to modify total_price to 100 while items sum to 38,000
    const tamperedRes = validateOrderPayload({
      reference: 'JK_123_abc',
      orderData: {
        customer_name: 'Hacker',
        email: 'hacker@example.com',
        customer_phone: '+2348000000000',
        shipping_address: 'Lagos',
        items: [{ price: 38000, quantity: 1 }],
        total_price: 100, // manipulated
      },
    });
    expect(tamperedRes.valid).toBe(false);
    expect(tamperedRes.error).toContain('Total price does not match sum of items');
  });

  test('Paystack failed payment status handling', () => {
    const failedPayload = createMockPaystackFailedResponse('JK_123_failed', 3800000);
    expect(failedPayload.data.status).toBe('failed');
    expect(failedPayload.data.paid_at).toBeNull();
  });
});

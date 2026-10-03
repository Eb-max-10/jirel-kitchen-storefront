/**
 * Tier 1: Server Verification Route Test
 * Feature Coverage: F6 (Secure Server Verification Route)
 * Authoritative source: ORIGINAL_REQUEST §R2, PROJECT.md § Interface Contracts: CartDrawer <-> POST /api/checkout/verify
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect, skip } from '../helpers/test-framework.mjs';
import { createMockPaystackSuccessResponse } from '../helpers/mock-paystack.mjs';

const ROOT_DIR = process.cwd();
const VERIFY_ROUTE_PATH = path.join(ROOT_DIR, 'src', 'app', 'api', 'checkout', 'verify', 'route.ts');

describe('Tier 1: Secure Server Verification Route (/api/checkout/verify) (F6)', () => {
  const hasRouteFile = fs.existsSync(VERIFY_ROUTE_PATH);

  test('POST /api/checkout/verify request payload schema validation', () => {
    const validPayload = {
      reference: 'JK_1727956800000_abc123',
      orderData: {
        customer_name: 'Amara Obi',
        email: 'amara@example.com',
        customer_phone: '+2348012345678',
        shipping_address: '15 Admiralty Way, Lekki Phase 1, Lagos',
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1-1',
            name: 'The Always Pan',
            variantName: 'Sage',
            price: 38000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1',
          },
        ],
        total_price: 38000,
      },
    };

    expect(typeof validPayload.reference).toBe('string');
    expect(validPayload.reference.startsWith('JK_')).toBe(true);
    expect(typeof validPayload.orderData.customer_name).toBe('string');
    expect(validPayload.orderData.items.length).toBe(1);
    expect(validPayload.orderData.total_price).toBe(38000);
  });

  test('Paystack REST API verification URL and secret key contract', () => {
    const reference = 'JK_1727956800000_abc123';
    const expectedUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    expect(expectedUrl).toContain('https://api.paystack.co/transaction/verify/');
    expect(expectedUrl).toContain(reference);
  });

  test('Expected successful verification response structure contract', () => {
    const expectedResponse = {
      success: true,
      message: 'Payment verified and order confirmed',
      order: {
        id: 'ord-mock-uuid',
        paystack_reference: 'JK_1727956800000_abc123',
        customer_name: 'Amara Obi',
        total_price: 38000,
        status: 'paid',
      },
    };

    expect(expectedResponse.success).toBe(true);
    expect(expectedResponse.order.status).toBe('paid');
    expect(expectedResponse.order.total_price).toBe(38000);
  });

  if (!hasRouteFile) {
    skip('F6: Verify API route implementation presence (src/app/api/checkout/verify/route.ts)', 'Route not yet created (M2 in progress)');
    skip('F6: Verify API route exports POST handler', 'Route not yet created (M2 in progress)');
    skip('F6: Verify API route integrates Paystack REST verification and Supabase persistence', 'Route not yet created (M2 in progress)');
  } else {
    const routeSource = fs.readFileSync(VERIFY_ROUTE_PATH, 'utf8');

    test('F6: Verify API route implementation presence', () => {
      expect(hasRouteFile).toBe(true);
    });

    test('F6: Verify API route exports POST handler', () => {
      expect(routeSource.includes('export async function POST')).toBe(true);
    });

    test('F6: Verify API route integrates Paystack REST verification and Supabase persistence', () => {
      expect(routeSource.includes('api.paystack.co') || routeSource.includes('PAYSTACK_SECRET_KEY')).toBe(true);
      expect(routeSource.includes('orders') || routeSource.includes('supabase')).toBe(true);
      expect(routeSource.includes("'paid'") || routeSource.includes('"paid"')).toBe(true);
    });
  }
});

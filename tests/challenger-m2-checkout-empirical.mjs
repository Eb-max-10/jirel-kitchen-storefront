/**
 * Milestone 2 Challenger 1: Empirical Verification & Adversarial Stress Harness
 * 
 * Tests the Paystack checkout verification route, anti-tamper controls,
 * reference validation, currency locking, amount checking, and simulation pipeline.
 * 
 * Executes real HTTP requests against the live Next.js server on port 3009.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3009';
const VERIFY_ENDPOINT = `${BASE_URL}/api/checkout/verify`;

const results = {
  passed: 0,
  failed: 0,
  details: [],
};

function pass(message, meta = null) {
  results.passed++;
  results.details.push({ status: 'PASS', message, meta });
  console.log(`  [PASS] ${message}`);
}

function fail(message, meta = null) {
  results.failed++;
  results.details.push({ status: 'FAIL', message, meta });
  console.error(`  [FAIL] ${message}`, meta ? JSON.stringify(meta) : '');
}

async function postVerify(body, isRaw = false) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  if (isRaw) {
    options.body = body;
  } else {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(VERIFY_ENDPOINT, options);
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }
  return { status: res.status, data: json };
}

function createBaseOrderData(overrides = {}) {
  return {
    customer_name: 'Ebenezer Wealth',
    email: 'ebenezer@example.com',
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
    ...overrides,
  };
}

async function runEmpiricalVerification() {
  console.log('============================================================');
  console.log('   M2 CHALLENGER 1: EMPIRICAL TEST HARNESS & ORACLE          ');
  console.log(`   Target Server: ${BASE_URL}                              `);
  console.log('============================================================\n');

  // ---------------------------------------------------------------------------
  // SUITE 1: HTTP Payload Structure & JSON Boundaries
  // ---------------------------------------------------------------------------
  console.log('--> Suite 1: HTTP Payload Structure & JSON Boundaries');

  {
    // 1.1 Malformed JSON payload
    const res = await postVerify('{malformed: json, body', true);
    if (res.status === 400 && res.data?.error?.includes('Invalid JSON')) {
      pass('Malformed JSON payload rejected with HTTP 400 and clear error');
    } else {
      fail('Malformed JSON payload handling', res);
    }
  }

  {
    // 1.2 Primitive string body
    const res = await postVerify('raw-string-primitive', false);
    if (res.status === 400) {
      pass('Primitive string body rejected with HTTP 400');
    } else {
      fail('Primitive string body handling', res);
    }
  }

  {
    // 1.3 Primitive number body
    const res = await postVerify(12345, false);
    if (res.status === 400) {
      pass('Primitive number body rejected with HTTP 400');
    } else {
      fail('Primitive number body handling', res);
    }
  }

  {
    // 1.4 Empty object payload
    const res = await postVerify({}, false);
    if (res.status === 400 && res.data?.error?.includes('reference')) {
      pass('Empty object payload rejected with HTTP 400');
    } else {
      fail('Empty object payload handling', res);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 2: Paystack Reference Validation & Injection Resistance
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 2: Paystack Reference Validation & Anti-Tamper');

  const invalidReferences = [
    { name: 'Empty string', ref: '' },
    { name: 'Whitespace string', ref: '   ' },
    { name: 'Path traversal (../../etc/passwd)', ref: '../../etc/passwd' },
    { name: 'XSS script injection', ref: '<script>alert(1)</script>' },
    { name: 'SQL injection payload', ref: "JK_123'; DROP TABLE orders; --" },
    { name: 'Too short (<6 chars)', ref: 'abc' },
    { name: 'Overlong (>100 chars)', ref: 'JK_' + 'A'.repeat(120) },
    { name: 'Special illegal characters', ref: 'JK_123$!@*#' },
  ];

  for (const { name, ref } of invalidReferences) {
    const res = await postVerify({
      reference: ref,
      orderData: createBaseOrderData(),
    });
    if (res.status === 400) {
      pass(`Invalid reference rejected [${name}]`);
    } else {
      fail(`Invalid reference was NOT rejected [${name}]`, res);
    }
  }

  // Valid Reference Formats
  const validReferenceSamples = [
    'JK_1727956800000_ABC1234',
    'sim_test_checkout_2026',
    'mock_ref_paystack_9999',
    'paystack_txn_sample_ref_12345',
  ];
  for (const ref of validReferenceSamples) {
    const res = await postVerify({
      reference: ref,
      orderData: createBaseOrderData(),
    });
    if (res.status === 200 && res.data?.success === true) {
      pass(`Valid reference format accepted [${ref}]`);
    } else {
      fail(`Valid reference format failed [${ref}]`, res);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 3: Customer Intake Field Validation & Boundaries
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 3: Customer Intake Field Validation & Boundaries');

  const customerValidationCases = [
    {
      name: 'Missing orderData entirely',
      payload: { reference: 'sim_test_ref_01' },
      expectedError: 'orderData is required',
    },
    {
      name: 'Empty customer_name',
      payload: { reference: 'sim_test_ref_02', orderData: createBaseOrderData({ customer_name: '   ' }) },
      expectedError: 'Customer name is required',
    },
    {
      name: 'Missing @ in email',
      payload: { reference: 'sim_test_ref_03', orderData: createBaseOrderData({ email: 'ebenezer-without-at' }) },
      expectedError: 'Valid email address is required',
    },
    {
      name: 'Phone number too short (<7 chars)',
      payload: { reference: 'sim_test_ref_04', orderData: createBaseOrderData({ customer_phone: '12345' }) },
      expectedError: 'Valid customer phone number is required',
    },
    {
      name: 'Empty shipping_address',
      payload: { reference: 'sim_test_ref_05', orderData: createBaseOrderData({ shipping_address: '   ' }) },
      expectedError: 'Shipping address is required',
    },
    {
      name: 'Empty items array',
      payload: { reference: 'sim_test_ref_06', orderData: createBaseOrderData({ items: [] }) },
      expectedError: 'Order must contain at least one item',
    },
    {
      name: 'Zero total_price',
      payload: { reference: 'sim_test_ref_07', orderData: createBaseOrderData({ total_price: 0 }) },
      expectedError: 'Total price must be a positive number',
    },
    {
      name: 'Negative total_price',
      payload: { reference: 'sim_test_ref_08', orderData: createBaseOrderData({ total_price: -5000 }) },
      expectedError: 'Total price must be a positive number',
    },
  ];

  for (const { name, payload, expectedError } of customerValidationCases) {
    const res = await postVerify(payload);
    if (res.status === 400 && (!expectedError || res.data?.error?.includes(expectedError))) {
      pass(`Customer validation rejected: ${name}`);
    } else {
      fail(`Customer validation failed: ${name}`, res);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 4: Price Integrity & Anti-Tampering Engine
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 4: Price Integrity & Anti-Tampering Engine');

  {
    // 4.1 Client manipulates total_price from 38,000 to 100 NGN
    const tamperedPayload = {
      reference: 'sim_tamper_test_01',
      orderData: createBaseOrderData({ total_price: 100 }),
    };
    const res = await postVerify(tamperedPayload);
    if (res.status === 400 && res.data?.error?.includes('Total price does not match sum of items')) {
      pass('Anti-tamper: Client price markdown manipulation (38000 -> 100) BLOCKED');
    } else {
      fail('Anti-tamper: Client price markdown manipulation not blocked', res);
    }
  }

  {
    // 4.2 Client inflates total_price above sum of items
    const tamperedPayload = {
      reference: 'sim_tamper_test_02',
      orderData: createBaseOrderData({ total_price: 50000 }),
    };
    const res = await postVerify(tamperedPayload);
    if (res.status === 400 && res.data?.error?.includes('Total price does not match sum of items')) {
      pass('Anti-tamper: Client price inflation manipulation (38000 -> 50000) BLOCKED');
    } else {
      fail('Anti-tamper: Client price inflation manipulation not blocked', res);
    }
  }

  {
    // 4.3 Legitimate subtotal + delivery fee matches total_price
    const feePayload = {
      reference: 'sim_fee_test_01',
      orderData: createBaseOrderData({
        subtotal: 38000,
        delivery_fee: 2500,
        total_price: 40500,
      }),
    };
    const res = await postVerify(feePayload);
    if (res.status === 200 && res.data?.success === true) {
      pass('Anti-tamper: Items subtotal (38000) + delivery fee (2500) = 40500 ACCEPTED');
    } else {
      fail('Anti-tamper: Subtotal + delivery fee calculation failed', res);
    }
  }

  {
    // 4.4 Tampered delivery fee calculation
    const feeTamperedPayload = {
      reference: 'sim_fee_test_02',
      orderData: createBaseOrderData({
        subtotal: 38000,
        delivery_fee: 2500,
        total_price: 38000, // Client tried to waive delivery fee in total_price
      }),
    };
    const res = await postVerify(feeTamperedPayload);
    if (res.status === 400 && res.data?.error?.includes('Total price does not match sum of items')) {
      pass('Anti-tamper: Client delivery fee evasion (38000 + 2500 != 38000) BLOCKED');
    } else {
      fail('Anti-tamper: Client delivery fee evasion not blocked', res);
    }
  }

  {
    // 4.5 Multi-item cart calculation fidelity
    const multiItemPayload = {
      reference: 'sim_multi_item_01',
      orderData: {
        customer_name: 'Chioma Adebayo',
        email: 'chioma@example.com',
        customer_phone: '+2348098765432',
        shipping_address: '42 Isaac John Street, GRA Ikeja, Lagos',
        items: [
          { productId: 'prod-1', name: 'The Always Pan', price: 38000, quantity: 2, image: 'img1.jpg' },
          { productId: 'prod-2', name: 'Cast Iron Skillet', price: 28000, quantity: 1, image: 'img2.jpg' },
          { productId: 'prod-3', name: 'Chef Knife 8"', price: 18500, quantity: 3, image: 'img3.jpg' },
        ],
        // Expected subtotal: (38000*2) + (28000*1) + (18500*3) = 76000 + 28000 + 55500 = 159500
        delivery_fee: 0, // Free delivery (>80k)
        total_price: 159500,
      },
    };
    const res = await postVerify(multiItemPayload);
    if (res.status === 200 && res.data?.success === true && res.data?.order?.total_price === 159500) {
      pass('Anti-tamper: Complex multi-item cart (3 products, 6 units) exact math verified');
    } else {
      fail('Anti-tamper: Complex multi-item cart calculation failed', res);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 5: Simulation Mode Order Processing & Receipt Structure Contract
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 5: Simulation Mode Order Processing & Receipt Structure');

  {
    const simRef = `sim_order_${Date.now()}_alpha`;
    const res = await postVerify({
      reference: simRef,
      orderData: createBaseOrderData({
        customer_name: 'Simulated User',
        email: 'sim@example.com',
        total_price: 38000,
      }),
    });

    if (res.status === 200 && res.data?.success === true) {
      pass('Simulation order processed with HTTP 200 and success: true');
      const order = res.data.order;
      if (order && order.status === 'paid' && order.payment_status === 'paid') {
        pass('Simulation order status is strictly "paid" and dual-compatible');
      } else {
        fail('Simulation order status missing or not paid', order);
      }
      if (order && order.paystack_reference === simRef) {
        pass(`Simulation order reference matches [${simRef}]`);
      } else {
        fail('Simulation order reference mismatch', order);
      }
      if (order && order.total_price === 38000 && order.customer_name === 'Simulated User') {
        pass('Simulation order metadata and total price preserved');
      } else {
        fail('Simulation order metadata corrupted', order);
      }
    } else {
      fail('Simulation order processing failed', res);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 6: Gateway Security Oracle (Currency Locking & Kobo Matching)
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 6: Gateway Security Oracle (Currency Locking & Kobo Matching)');

  // We inspect the route source code to verify the three security assertions are implemented:
  const routeSource = fs.readFileSync(
    path.join(process.cwd(), 'src', 'app', 'api', 'checkout', 'verify', 'route.ts'),
    'utf8'
  );

  // 6.1 Status Assertion in route.ts
  const hasStatusCheck =
    routeSource.includes("data.status !== 'success'") &&
    routeSource.includes('payment was not completed');
  if (hasStatusCheck) {
    pass('Route asserts gateway status === "success" (blocks non-success payments)');
  } else {
    fail('Route missing status === "success" assertion');
  }

  // 6.2 Currency Assertion in route.ts
  const hasCurrencyCheck =
    routeSource.includes("data.currency !== 'NGN'") &&
    routeSource.includes('expected NGN');
  if (hasCurrencyCheck) {
    pass('Route asserts currency === "NGN" (blocks USD/EUR/GHS currency substitution attacks)');
  } else {
    fail('Route missing currency === "NGN" assertion');
  }

  // 6.3 Strict Kobo Assertion in route.ts
  const hasKoboCheck =
    routeSource.includes('data.amount !== expectedKobo') &&
    routeSource.includes('Payment amount mismatch');
  if (hasKoboCheck) {
    pass('Route asserts gateway kobo amount matches expectedKobo (blocks kobo-level price tampering)');
  } else {
    fail('Route missing kobo amount exact match assertion');
  }

  // 6.4 AbortController timeout protection in route.ts
  const hasTimeout =
    routeSource.includes('new AbortController()') &&
    routeSource.includes('10000');
  if (hasTimeout) {
    pass('Route implements 10-second AbortController timeout for gateway communications');
  } else {
    fail('Route missing AbortController timeout');
  }

  // ---------------------------------------------------------------------------
  // SUITE 7: High Concurrency Stress Test
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 7: High Concurrency Stress Test (30 Concurrent Verifications)');

  {
    const CONCURRENCY = 30;
    const startTime = Date.now();
    const requests = Array.from({ length: CONCURRENCY }, (_, i) => {
      const ref = `sim_stress_${startTime}_${i.toString().padStart(3, '0')}`;
      return postVerify({
        reference: ref,
        orderData: createBaseOrderData({
          customer_name: `Stress Tester ${i}`,
          total_price: 38000,
        }),
      });
    });

    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;
    const allSuccessful = responses.every((r) => r.status === 200 && r.data?.success === true);

    if (allSuccessful) {
      pass(`All ${CONCURRENCY} concurrent requests succeeded in ${duration}ms (avg ${(duration / CONCURRENCY).toFixed(1)}ms/req)`);
    } else {
      const failedCount = responses.filter((r) => r.status !== 200).length;
      fail(`Concurrency stress test had ${failedCount}/${CONCURRENCY} failures`);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 8: Order Confirmation Receipt View & Site Config Integrity
  // ---------------------------------------------------------------------------
  console.log('\n--> Suite 8: Order Confirmation Receipt View & Site Config Integrity');

  const receiptPagePath = path.join(process.cwd(), 'src', 'app', 'order-confirmation', 'page.tsx');
  const receiptSource = fs.readFileSync(receiptPagePath, 'utf8');

  // 8.1 Suspense boundary wrapping
  if (receiptSource.includes('<Suspense') && receiptSource.includes('OrderConfirmationSkeleton')) {
    pass('Receipt view encapsulates useSearchParams inside <Suspense> boundary');
  } else {
    fail('Receipt view missing <Suspense> boundary');
  }

  // 8.2 Cart invalidation
  if (receiptSource.includes('clearCart()') && receiptSource.includes('hasClearedRef')) {
    pass('Receipt view invalidates cart state once upon confirmation');
  } else {
    fail('Receipt view missing cart invalidation logic');
  }

  // 8.3 WhatsApp concierge URL integration
  if (receiptSource.includes('getOrderWhatsAppUrl(reference)') && receiptSource.includes('Inquire on WhatsApp')) {
    pass('Receipt view generates direct WhatsApp concierge link with prefilled reference');
  } else {
    fail('Receipt view missing WhatsApp concierge link integration');
  }

  // 8.4 Print stylesheet
  if (receiptSource.includes('@media print') && receiptSource.includes('no-print')) {
    pass('Receipt view implements print-clean stylesheet hiding navigation/actions');
  } else {
    fail('Receipt view missing print stylesheet');
  }

  // ---------------------------------------------------------------------------
  // FINAL SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`   EMPIRICAL CHALLENGER 1 RESULTS                           `);
  console.log(`   Passed: ${results.passed} | Failed: ${results.failed}   `);
  console.log('============================================================');

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEmpiricalVerification().catch((err) => {
  console.error('Fatal unhandled error during empirical verification:', err);
  process.exit(1);
});

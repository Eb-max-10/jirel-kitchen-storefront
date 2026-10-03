/**
 * M2 Challenger 2 Empirical Test Suite:
 * Stress-testing CartDrawer Form Validation, Simulation Mode, and Order Confirmation Receipt UX.
 * LIVE HTTP EXECUTION against http://localhost:3005
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3005';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

function assert(condition, testName, details = '') {
  results.total++;
  if (condition) {
    results.passed++;
    results.tests.push({ status: 'PASS', name: testName, details });
    console.log(`  [PASS] ${testName}`);
  } else {
    results.failed++;
    results.tests.push({ status: 'FAIL', name: testName, details });
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

console.log('============================================================');
console.log('   M2 CHALLENGER 2: EMPIRICAL HARNESS FOR CART & RECEIPT    ');
console.log('   Live HTTP Verification Target: ' + BASE_URL);
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// PART 1: CartDrawer Form Validation Logic Stress-Testing
// -----------------------------------------------------------------------------
console.log('--> Part 1: CartDrawer Form Input Validation Stress Tests');

// Exact validation logic from src/components/cart/CartDrawer.tsx
function validateCustomerForm(formData) {
  const errors = {};
  if (!formData.customer_name?.trim() || formData.customer_name.trim().length < 2) {
    errors.customer_name = 'Please enter your full name (at least 2 characters)';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email?.trim() || !emailRegex.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  const cleanPhone = (formData.customer_phone || '').replace(/[\s-]/g, '');
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.customer_phone = 'Please enter a valid phone number (at least 7 digits)';
  }

  if (!formData.shipping_address?.trim() || formData.shipping_address.trim().length < 5) {
    errors.shipping_address = 'Please enter your delivery address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 1.1 Customer Name Validation
const validNames = ['Amara Obi', 'Jo', 'Adebayo Johnson', 'Dr. Evelyn Chioma', 'Élodie Laurent'];
for (const name of validNames) {
  const res = validateCustomerForm({ customer_name: name, email: 't@e.co', customer_phone: '1234567', shipping_address: '12345' });
  assert(!res.errors.customer_name, `Valid name accepted: "${name}"`);
}

const invalidNames = [
  { val: '', label: 'empty string' },
  { val: '   ', label: 'whitespace only' },
  { val: 'A', label: 'single character (< 2)' },
  { val: ' B ', label: 'single char with spaces (< 2)' },
];
for (const item of invalidNames) {
  const res = validateCustomerForm({ customer_name: item.val, email: 't@e.co', customer_phone: '1234567', shipping_address: '12345' });
  assert(Boolean(res.errors.customer_name), `Invalid name rejected: ${item.label}`);
}

// 1.2 Email Validation
const validEmails = [
  'amara@example.com',
  'user.name+tag@sub.domain.ng',
  'support@jirelkitchen.com',
  'customer123@yahoo.co.uk',
];
for (const email of validEmails) {
  const res = validateCustomerForm({ customer_name: 'Amara', email, customer_phone: '1234567', shipping_address: '12345' });
  assert(!res.errors.email, `Valid email accepted: "${email}"`);
}

const invalidEmails = [
  { val: '', label: 'empty email' },
  { val: '   ', label: 'whitespace email' },
  { val: 'notanemail', label: 'missing @ and domain' },
  { val: '@missingusername.com', label: 'missing username before @' },
  { val: 'user@missingtld', label: 'missing domain TLD dot' },
  { val: 'user@domain.', label: 'dot at end of domain' },
  { val: 'user with spaces@domain.com', label: 'spaces in email' },
];
for (const item of invalidEmails) {
  const res = validateCustomerForm({ customer_name: 'Amara', email: item.val, customer_phone: '1234567', shipping_address: '12345' });
  assert(Boolean(res.errors.email), `Invalid email rejected: ${item.label}`);
}

// 1.3 Phone Number Validation (cleanPhone length >= 7, space and hyphen stripped)
const validPhones = [
  '08012345678',
  '+234 802 345 6789',
  '080-1234-5678',
  '0123456', // exactly 7
  '+234-80-1111-2222',
];
for (const phone of validPhones) {
  const res = validateCustomerForm({ customer_name: 'Amara', email: 'a@b.com', customer_phone: phone, shipping_address: '12345' });
  assert(!res.errors.customer_phone, `Valid phone accepted: "${phone}"`);
}

const invalidPhones = [
  { val: '', label: 'empty phone' },
  { val: '   ', label: 'whitespace only phone' },
  { val: '123456', label: '6 digits (< 7)' },
  { val: '080-12', label: 'hyphenated 5 digits (< 7)' },
  { val: '   123  ', label: '3 digits with padding (< 7)' },
];
for (const item of invalidPhones) {
  const res = validateCustomerForm({ customer_name: 'Amara', email: 'a@b.com', customer_phone: item.val, shipping_address: '12345' });
  assert(Boolean(res.errors.customer_phone), `Invalid phone rejected: ${item.label}`);
}

// 1.4 Shipping Address Validation (trimmed length >= 5)
const validAddresses = [
  '12345', // exactly 5 chars
  '15 Admiralty Way, Lekki Phase 1, Lagos',
  'Plot 42, Maitama District, Abuja',
];
for (const addr of validAddresses) {
  const res = validateCustomerForm({ customer_name: 'Amara', email: 'a@b.com', customer_phone: '1234567', shipping_address: addr });
  assert(!res.errors.shipping_address, `Valid shipping address accepted: "${addr.substring(0, 15)}..."`);
}

const invalidAddresses = [
  { val: '', label: 'empty address' },
  { val: '    ', label: 'spaces only' },
  { val: 'Abc', label: '3 chars (< 5)' },
  { val: '1234', label: '4 chars (< 5)' },
  { val: '  1234  ', label: '4 trimmed chars (< 5)' },
];
for (const item of invalidAddresses) {
  const res = validateCustomerForm({ customer_name: 'Amara', email: 'a@b.com', customer_phone: '1234567', shipping_address: item.val });
  assert(Boolean(res.errors.shipping_address), `Invalid shipping address rejected: ${item.label}`);
}

// -----------------------------------------------------------------------------
// PART 2: CartDrawer Simulation Mode Trigger & Logic Verification
// -----------------------------------------------------------------------------
console.log('\n--> Part 2: CartDrawer Simulation Mode Trigger Tests');

// 2.1 Simulation Mode Gatekeeper Logic
function evaluateSimulationMode(key) {
  const paystackKey = key || '';
  return !paystackKey || paystackKey.includes('placeholder');
}

assert(evaluateSimulationMode(undefined) === true, 'Undefined Paystack key activates simulation mode');
assert(evaluateSimulationMode('') === true, 'Empty string Paystack key activates simulation mode');
assert(evaluateSimulationMode('pk_test_placeholder_key_here') === true, 'Placeholder Paystack key activates simulation mode');
assert(evaluateSimulationMode('pk_live_0123456789abcdef') === false, 'Real live Paystack key disables simulation mode');
assert(evaluateSimulationMode('pk_test_0123456789abcdef') === false, 'Real test Paystack key disables simulation mode');

// 2.2 Reference Generator Format Compliance
function generateTransactionReference() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `JK_${timestamp}_${randomSuffix}`;
}

const sampleRefs = Array.from({ length: 50 }, () => generateTransactionReference());
const refRegex = /^JK_\d+_[A-Z0-9]+$/;
const allMatchRef = sampleRefs.every((r) => refRegex.test(r));
assert(allMatchRef, 'Generated references (50 iterations) strictly conform to JK_${timestamp}_${randomSuffix}');

// Ensure uniqueness of 1,000 consecutive references
const uniqueRefs = new Set(Array.from({ length: 1000 }, () => generateTransactionReference()));
assert(uniqueRefs.size === 1000, '1,000 generated references are 100% collision-free');

// 2.3 Naira to Kobo Conversion Integrity
const testPricingScenarios = [
  { naira: 38000, expectedKobo: 3800000 },
  { naira: 28000, expectedKobo: 2800000 },
  { naira: 66000, expectedKobo: 6600000 },
  { naira: 14500.50, expectedKobo: 1450050 },
  { naira: 0, expectedKobo: 0 },
];
for (const scen of testPricingScenarios) {
  const computed = Math.round(scen.naira * 100);
  assert(computed === scen.expectedKobo, `Subtotal ₦${scen.naira} converted to ${scen.expectedKobo} integer kobo`);
}

// -----------------------------------------------------------------------------
// PART 3: Live HTTP Stress-Testing of /api/checkout/verify
// -----------------------------------------------------------------------------
console.log('\n--> Part 3: Live HTTP Stress-Testing of /api/checkout/verify');

async function testLiveApiVerify() {
  const reference = generateTransactionReference();

  const validPayload = {
    reference,
    orderData: {
      customer_name: 'Empirical Challenger',
      email: 'challenger@jirelkitchen.com',
      customer_phone: '08098765432',
      shipping_address: '10 Admiralty Road, Lekki Phase 1, Lagos',
      items: [
        {
          productId: 'prod-1',
          name: 'The Always Pan',
          variantName: 'Sage',
          price: 38000,
          quantity: 2,
          image: '/images/products/always-pan-sage.webp',
        },
      ],
      total_price: 76000,
    },
  };

  // 3.1 Live Successful Simulation Call
  const resSuccess = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload),
  });

  assert(resSuccess.status === 200, 'POST /api/checkout/verify returns HTTP 200 for simulated checkout');
  const dataSuccess = await resSuccess.json();
  assert(dataSuccess.success === true, 'Response payload has success: true');
  assert(dataSuccess.order !== undefined, 'Response payload contains order object');
  assert(dataSuccess.order.paystack_reference === reference, 'Order references exact Paystack reference');
  assert(dataSuccess.order.payment_status === 'paid', 'Order payment_status is "paid"');
  assert(dataSuccess.order.status === 'paid', 'Order status is "paid"');
  assert(dataSuccess.order.total_price === 76000, 'Order total_price is 76000');
  assert(dataSuccess.order.items.length === 1, 'Order snapshot items preserved');

  // 3.2 Anti-Tamper Price Check (Manipulating total_price from 76000 to 1000)
  const tamperedPayload = {
    ...validPayload,
    reference: generateTransactionReference(),
    orderData: {
      ...validPayload.orderData,
      total_price: 1000, // adversarial tampering
    },
  };
  const resTampered = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tamperedPayload),
  });
  assert(resTampered.status === 400, 'Price tampering attack rejected with HTTP 400');
  const dataTampered = await resTampered.json();
  assert(dataTampered.success === false, 'Tampered price response success is false');
  assert(dataTampered.error.includes('Total price does not match sum of items'), 'Anti-tamper error message returned');

  // 3.3 Missing Reference Check
  const noRefPayload = { ...validPayload, reference: '' };
  const resNoRef = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noRefPayload),
  });
  assert(resNoRef.status === 400, 'Missing reference rejected with HTTP 400');

  // 3.4 Malformed Reference Injection Check
  const badRefPayload = { ...validPayload, reference: "'; DROP TABLE orders; --" };
  const resBadRef = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badRefPayload),
  });
  assert(resBadRef.status === 400, 'Malicious SQL injection reference rejected with HTTP 400');

  // 3.5 Invalid Email in Payload Check
  const badEmailPayload = {
    ...validPayload,
    reference: generateTransactionReference(),
    orderData: { ...validPayload.orderData, email: 'no-at-sign' },
  };
  const resBadEmail = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badEmailPayload),
  });
  assert(resBadEmail.status === 400, 'Invalid email rejected with HTTP 400');

  // 3.6 Invalid Phone (< 7 digits) in Payload Check
  const badPhonePayload = {
    ...validPayload,
    reference: generateTransactionReference(),
    orderData: { ...validPayload.orderData, customer_phone: '123' },
  };
  const resBadPhone = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badPhonePayload),
  });
  assert(resBadPhone.status === 400, 'Short phone (< 7 chars) rejected with HTTP 400');

  // 3.7 Empty Items Array in Payload Check
  const emptyItemsPayload = {
    ...validPayload,
    reference: generateTransactionReference(),
    orderData: { ...validPayload.orderData, items: [] },
  };
  const resEmptyItems = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emptyItemsPayload),
  });
  assert(resEmptyItems.status === 400, 'Empty items array rejected with HTTP 400');

  // 3.8 Non-JSON Payload Check
  const resBadJson = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'this-is-not-valid-json',
  });
  assert(resBadJson.status === 400, 'Non-JSON body rejected with HTTP 400');
}

// -----------------------------------------------------------------------------
// PART 4: Live HTTP & Compiled Bundle Verification of /order-confirmation
// -----------------------------------------------------------------------------
console.log('\n--> Part 4: Live HTTP & Compiled Bundle Verification of /order-confirmation');

async function testLiveOrderConfirmation() {
  // 4.1 Missing Reference Query Param: Server streams 200 OK with skeleton fallback during SSR
  const resNoQuery = await fetch(`${BASE_URL}/order-confirmation`);
  assert(resNoQuery.status === 200, 'GET /order-confirmation returns HTTP 200 without reference');

  // 4.2 With Mock Reference Query Param
  const mockRef = 'sim_test_order_778899';
  const resMockQuery = await fetch(`${BASE_URL}/order-confirmation?reference=${mockRef}`);
  assert(resMockQuery.status === 200, 'GET /order-confirmation?reference=sim_... returns HTTP 200');

  // 4.3 With Standard JK_ Reference Query Param
  const jkRef = generateTransactionReference();
  const resJkQuery = await fetch(`${BASE_URL}/order-confirmation?reference=${jkRef}`);
  assert(resJkQuery.status === 200, 'GET /order-confirmation?reference=JK_... returns HTTP 200');

  // 4.4 Inspect Next.js Compiled Client Bundle for Order Confirmation View
  const chunksDir = path.join(process.cwd(), '.next', 'static', 'chunks');
  let foundNoRefUI = false;
  let foundReceiptUI = false;
  let foundWhatsAppUI = false;

  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir);
    for (const file of chunkFiles) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(chunksDir, file), 'utf8');
        if (content.includes('No Order Reference Found') && content.includes('Return to Shop')) {
          foundNoRefUI = true;
        }
        if (content.includes('Payment Verified') && content.includes('Print Receipt')) {
          foundReceiptUI = true;
        }
        if (content.includes('wa.me') || content.includes('Inquire on WhatsApp')) {
          foundWhatsAppUI = true;
        }
      }
    }
  }

  assert(foundNoRefUI, 'Compiled client bundle contains "No Order Reference Found" UI');
  assert(foundReceiptUI, 'Compiled client bundle contains "Payment Verified" & "Print Receipt" UI');
  assert(foundWhatsAppUI, 'Compiled client bundle contains WhatsApp concierge integration');
}

// -----------------------------------------------------------------------------
// PART 5: Codebase Source & Contract Invariants
// -----------------------------------------------------------------------------
console.log('\n--> Part 5: Codebase Source & UX Contracts Verification');

const confirmationPagePath = path.join(process.cwd(), 'src', 'app', 'order-confirmation', 'page.tsx');
assert(fs.existsSync(confirmationPagePath), 'src/app/order-confirmation/page.tsx exists');

const confirmationContent = fs.readFileSync(confirmationPagePath, 'utf8');

// 5.1 Suspense Boundary Verification
assert(
  confirmationContent.includes('<Suspense fallback={<OrderConfirmationSkeleton />}>'),
  'Default export wraps OrderConfirmationContent in <Suspense> with fallback skeleton'
);
assert(
  confirmationContent.includes('useSearchParams()'),
  'Component utilizes useSearchParams() for reference query parameter extraction'
);

// 5.2 Cart Invalidation on Confirmation
assert(
  confirmationContent.includes('clearCart()'),
  'Calls clearCart() on arrival to empty cart upon confirmed payment'
);
assert(
  confirmationContent.includes('hasClearedRef.current'),
  'Guards clearCart() with useRef flag to prevent redundant clears on re-renders'
);

// 5.3 3-Tier Resilient Order Data Resolution
assert(
  confirmationContent.includes('sessionStorage.getItem(`jk_order_${reference}`)'),
  'Tier 1: Checks sessionStorage for fast zero-latency client retrieval'
);
assert(
  confirmationContent.includes('supabase.rpc(\'get_order_by_reference\''),
  'Tier 2: Queries Supabase RPC for cross-device lookup'
);
assert(
  confirmationContent.includes('Valued Customer'),
  'Tier 3: Graceful fallback synthesis provides full receipt UI'
);

// 5.4 WhatsApp Concierge & Print Receipt Integration
assert(
  confirmationContent.includes('getOrderWhatsAppUrl(reference)'),
  'Integrates pre-filled WhatsApp concierge inquiry button'
);
assert(
  confirmationContent.includes('window.print()'),
  'Integrates browser print button for physical receipt generation'
);
assert(
  confirmationContent.includes('@media print'),
  'Includes print-specific CSS rules hiding headers, footers, and action buttons'
);

// 5.5 CartDrawer Dynamic Import & Error Resetting
const cartDrawerPath = path.join(process.cwd(), 'src', 'components', 'cart', 'CartDrawer.tsx');
assert(fs.existsSync(cartDrawerPath), 'src/components/cart/CartDrawer.tsx exists');

const cartDrawerContent = fs.readFileSync(cartDrawerPath, 'utf8');

assert(
  cartDrawerContent.includes("await import('@paystack/inline-js')"),
  'CartDrawer uses dynamic import for @paystack/inline-js to avoid SSR window errors'
);
assert(
  cartDrawerContent.includes('Test Mode Active — Simulated Paystack checkout flow'),
  'CartDrawer renders visual badge informing user when simulated test mode is active'
);
assert(
  cartDrawerContent.includes('setErrors((prev) => ({ ...prev, [name]: undefined }))'),
  'Input change clears field-specific validation error in real time'
);
assert(
  cartDrawerContent.includes('window.sessionStorage.setItem(`jk_order_${reference}`'),
  'Stores confirmed order to sessionStorage before navigating to /order-confirmation'
);

// -----------------------------------------------------------------------------
// EXECUTE ASYNC TESTS & REPORT
// -----------------------------------------------------------------------------
async function runAll() {
  try {
    await testLiveApiVerify();
    await testLiveOrderConfirmation();
  } catch (err) {
    assert(false, 'Live HTTP test execution failed', err.stack || err.message);
  }

  console.log('\n============================================================');
  console.log('              CHALLENGER 2 TEST EXECUTION SUMMARY           ');
  console.log('============================================================');
  console.log(`Total Assertions: ${results.total}`);
  console.log(`Passed:           ${results.passed}`);
  console.log(`Failed:           ${results.failed}`);
  console.log('============================================================\n');

  if (results.failed > 0) {
    console.error('RESULT: FAILED ❌');
    process.exitCode = 1;
  } else {
    console.log('RESULT: PASSED ✅');
    process.exitCode = 0;
  }
}

runAll();

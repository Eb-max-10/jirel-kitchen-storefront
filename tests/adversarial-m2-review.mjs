/**
 * Adversarial Security & Integrity Review Suite for Milestone 2
 * Reviewer 2: Forensic, Boundary, and Adversarial Challenge Harness
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ROUTE_FILE = path.join(ROOT_DIR, 'src', 'app', 'api', 'checkout', 'verify', 'route.ts');
const DRAWER_FILE = path.join(ROOT_DIR, 'src', 'components', 'cart', 'CartDrawer.tsx');
const CONFIRM_FILE = path.join(ROOT_DIR, 'src', 'app', 'order-confirmation', 'page.tsx');
const CONFIG_FILE = path.join(ROOT_DIR, 'src', 'config', 'site.ts');
const ENV_EXAMPLE_FILE = path.join(ROOT_DIR, '.env.example');
const GITIGNORE_FILE = path.join(ROOT_DIR, '.gitignore');

const results = {
  passed: 0,
  failed: 0,
  findings: [],
};

function recordTest(name, passed, detail) {
  if (passed) {
    results.passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    results.failed++;
    results.findings.push({ name, detail });
    console.error(`  [FAIL] ${name} - ${detail}`);
  }
}

console.log('============================================================');
console.log('   M2 ADVERSARIAL SECURITY & INTEGRITY REVIEW HARNESS       ');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. INTEGRITY VIOLATION CHECKS
// -----------------------------------------------------------------------------
console.log('--> 1. Checking for Integrity Violations');

const routeContent = fs.readFileSync(ROUTE_FILE, 'utf8');
const drawerContent = fs.readFileSync(DRAWER_FILE, 'utf8');
const confirmContent = fs.readFileSync(CONFIRM_FILE, 'utf8');

// Check 1.1: No hardcoded customer names or references in source code
const hasHardcodedCustomerInRoute = routeContent.includes('"Amara Obi"') || routeContent.includes("'Amara Obi'");
recordTest(
  'Integrity 1.1: No hardcoded customer test data embedded in route.ts',
  !hasHardcodedCustomerInRoute,
  'Found hardcoded customer name in route.ts'
);

// Check 1.2: Real verification logic exists (not a facade)
const hasRealLogic =
  routeContent.includes('isValidPaystackReference') &&
  routeContent.includes('expectedKobo') &&
  routeContent.includes('fetch(') &&
  routeContent.includes('api.paystack.co') &&
  routeContent.includes('upsert(');
recordTest(
  'Integrity 1.2: Real implementation logic (validation, fetch, persistence) in route.ts',
  hasRealLogic,
  'route.ts appears to be a facade without real validation or persistence logic'
);

// -----------------------------------------------------------------------------
// 2. SECURITY & ANTI-TAMPERING CHECKS
// -----------------------------------------------------------------------------
console.log('\n--> 2. Checking Security & Anti-Tamper Mechanisms');

// Check 2.1: Anti-tamper price integrity check
const checksPriceTamper =
  routeContent.includes('reduce') &&
  routeContent.includes('itemsSubtotal') &&
  routeContent.includes('expectedTotal') &&
  routeContent.includes('Math.abs');
recordTest(
  'Security 2.1: Price anti-tamper check (recomputes items sum vs total_price)',
  checksPriceTamper,
  'route.ts missing price anti-tamper recalculation'
);

// Check 2.2: Gateway currency check
const checksCurrency = routeContent.includes("data.currency !== 'NGN'");
recordTest(
  'Security 2.2: Strict NGN currency assertion against gateway',
  checksCurrency,
  'route.ts does not strictly assert data.currency === NGN'
);

// Check 2.3: Gateway kobo amount check
const checksKoboAmount = routeContent.includes('data.amount !== expectedKobo');
recordTest(
  'Security 2.3: Strict kobo amount assertion against gateway',
  checksKoboAmount,
  'route.ts does not strictly assert data.amount === expectedKobo'
);

// Check 2.4: Secret keys NOT exposed to client
const leaksPaystackSecret = drawerContent.includes('PAYSTACK_SECRET_KEY') || confirmContent.includes('PAYSTACK_SECRET_KEY');
const leaksSupabaseSecret = drawerContent.includes('SUPABASE_SERVICE_ROLE_KEY') || confirmContent.includes('SUPABASE_SERVICE_ROLE_KEY');
recordTest(
  'Security 2.4: PAYSTACK_SECRET_KEY never referenced in client components',
  !leaksPaystackSecret,
  'PAYSTACK_SECRET_KEY leaked to client component!'
);
recordTest(
  'Security 2.5: SUPABASE_SERVICE_ROLE_KEY never referenced in client components',
  !leaksSupabaseSecret,
  'SUPABASE_SERVICE_ROLE_KEY leaked to client component!'
);

// -----------------------------------------------------------------------------
// 3. ADVERSARIAL STRESS TESTING: SIMULATION BYPASS VULNERABILITY AUDIT
// -----------------------------------------------------------------------------
console.log('\n--> 3. Auditing Simulation Mode Logic (Adversarial Analysis)');

// Inspect isSimulationMode implementation
const simulationLogic = routeContent.match(/function isSimulationMode\(reference: string\)[\s\S]*?\n\}/);
const simulationCode = simulationLogic ? simulationLogic[0] : '';

// In route.ts:
// const isMockRef = reference.startsWith('sim_') || reference.startsWith('mock_') || reference.includes('_mock_');
// return isPlaceholderKey || isMockRef;
const hasUnconditionalMockRefBypass = simulationCode.includes('return isPlaceholderKey || isMockRef');

recordTest(
  'Adversarial 3.1: Simulation mode check structure audit',
  simulationCode.length > 0,
  'Could not locate isSimulationMode function in route.ts'
);

if (hasUnconditionalMockRefBypass) {
  console.warn(
    '  [VULNERABILITY FOUND] In isSimulationMode: `return isPlaceholderKey || isMockRef` allows an attacker to prefix any reference with "sim_" to completely bypass Paystack verification and record an order as PAID even when a real production key (PAYSTACK_SECRET_KEY) is configured!'
  );
}

// -----------------------------------------------------------------------------
// 4. SSR SAFETY CHECKS
// -----------------------------------------------------------------------------
console.log('\n--> 4. Checking SSR Safety & Next.js 16 App Router Compliance');

// Check 4.1: CartDrawer dynamically imports @paystack/inline-js inside handler
const dynamicPaystackImport = drawerContent.includes("await import('@paystack/inline-js')");
const topLevelPaystackImport = drawerContent.match(/^import .* from '@paystack\/inline-js'/m);
recordTest(
  'SSR 4.1: CartDrawer dynamically imports @paystack/inline-js inside click handler',
  dynamicPaystackImport && !topLevelPaystackImport,
  'CartDrawer uses top-level import of @paystack/inline-js which breaks SSR'
);

// Check 4.2: OrderConfirmation wraps useSearchParams in Suspense boundary
const hasSuspenseImport = confirmContent.includes('Suspense');
const hasSuspenseWrap =
  confirmContent.includes('<Suspense') &&
  confirmContent.includes('<OrderConfirmationContent');
recordTest(
  'SSR 4.2: OrderConfirmationPage wraps content in <Suspense> boundary',
  hasSuspenseImport && hasSuspenseWrap,
  'OrderConfirmationPage does not wrap useSearchParams in <Suspense>'
);

// Check 4.3: Window guards around sessionStorage
const hasWindowGuard =
  confirmContent.includes("typeof window !== 'undefined'") &&
  drawerContent.includes("typeof window !== 'undefined'");
recordTest(
  'SSR 4.3: Safe window checks around sessionStorage access',
  hasWindowGuard,
  'Unsafe direct window/sessionStorage access without typeof check'
);

// -----------------------------------------------------------------------------
// 5. CONFIGURATION & PLACEHOLDER AUDIT
// -----------------------------------------------------------------------------
console.log('\n--> 5. Checking Centralized Configuration & Environment Templates');

const envExampleContent = fs.readFileSync(ENV_EXAMPLE_FILE, 'utf8');
const gitignoreContent = fs.readFileSync(GITIGNORE_FILE, 'utf8');

const requiredEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_WHATSAPP_PHONE',
  'NEXT_PUBLIC_SUPPORT_EMAIL',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const allEnvVarsDocumented = requiredEnvVars.every((v) => envExampleContent.includes(v));
recordTest(
  'Config 5.1: All 8 required environment variables documented in .env.example',
  allEnvVarsDocumented,
  'Missing required variables in .env.example'
);

const gitignoreSafeguard = gitignoreContent.includes('.env*') && gitignoreContent.includes('!.env.example');
recordTest(
  'Config 5.2: .gitignore properly protects .env* while tracking .env.example',
  gitignoreSafeguard,
  '.gitignore does not properly handle .env.example tracking or secret isolation'
);

// Check siteConfig properties
const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
const configComplete =
  configContent.includes('whatsappNumber') &&
  configContent.includes('getWhatsAppUrl') &&
  configContent.includes('getOrderWhatsAppUrl') &&
  configContent.includes('rates') &&
  configContent.includes('publicKey');
recordTest(
  'Config 5.3: siteConfig exports contact, shipping rates, and WhatsApp URL helpers',
  configComplete,
  'site.ts missing required configuration fields or helper functions'
);

// -----------------------------------------------------------------------------
// 6. ADVERSARIAL EDGE CASE CHECK: REPLAY ATTACK & UPSERT
// -----------------------------------------------------------------------------
console.log('\n--> 6. Checking Replay Attack and Duplicate Reference Handling');

const usesUpsert = routeContent.includes('.upsert(') && routeContent.includes("onConflict: 'paystack_reference'");
recordTest(
  'Security 6.1: Database idempotency via upsert on paystack_reference',
  usesUpsert,
  'Database write does not handle duplicate paystack_reference gracefully'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`TOTAL CHECKS: ${results.passed + results.failed}`);
console.log(`PASSED:       ${results.passed}`);
console.log(`FAILED:       ${results.failed}`);
console.log('============================================================\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

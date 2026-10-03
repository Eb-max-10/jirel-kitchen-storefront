#!/usr/bin/env node

/**
 * Jirel Kitchen Storefront E2E Master Test Runner
 * Executes Tiers 1-4 tests covering Feature Coverage, Boundaries, Combinations, and Real-World Scenarios.
 *
 * Usage:
 *   node tests/run-all.mjs              # Run all active tiers
 *   node tests/run-all.mjs --tier=1     # Run Tier 1 only
 *   node tests/run-all.mjs --tier=2     # Run Tier 2 only
 *   node tests/run-all.mjs --tier=3     # Run Tier 3 only
 *   node tests/run-all.mjs --tier=4     # Run Tier 4 only
 *   node tests/run-all.mjs --strict     # Run all tiers; fail if any milestone tests are pending/skipped
 */

import { registry } from './helpers/test-framework.mjs';

const args = process.argv.slice(2);
const isStrict = args.includes('--strict');
const tierArg = args.find((a) => a.startsWith('--tier='));
const targetTier = tierArg ? tierArg.split('=')[1] : null;

async function runSuite() {
  console.log('============================================================');
  console.log('   STARTING JIREL KITCHEN E2E AUTOMATED TEST SUITE');
  console.log(`   Target: ${targetTier ? `Tier ${targetTier}` : 'All Tiers (1-4)'}`);
  console.log(`   Mode:   ${isStrict ? 'Strict (Pending tests will fail)' : 'Progressive (Milestone-Aware)'}`);
  console.log('============================================================\n');

  try {
    // Tier 1: Feature Coverage
    if (!targetTier || targetTier === '1') {
      console.log('--> Loading Tier 1: Feature Coverage...');
      await import('./tier1-feature-coverage/schema-and-seed.test.mjs');
      await import('./tier1-feature-coverage/paystack-checkout.test.mjs');
      await import('./tier1-feature-coverage/verify-endpoint.test.mjs');
      await import('./tier1-feature-coverage/product-detail.test.mjs');
      await import('./tier1-feature-coverage/site-config.test.mjs');
      await import('./tier1-feature-coverage/build-check.test.mjs');
    }

    // Tier 2: Boundary & Corner Cases
    if (!targetTier || targetTier === '2') {
      console.log('--> Loading Tier 2: Boundary & Corner Cases...');
      await import('./tier2-boundary-cases/api-boundaries.test.mjs');
      await import('./tier2-boundary-cases/cart-boundaries.test.mjs');
      await import('./tier2-boundary-cases/slug-boundaries.test.mjs');
    }

    // Tier 3: Combinations & Referential Integrity
    if (!targetTier || targetTier === '3') {
      console.log('--> Loading Tier 3: Combinations & Referential Integrity...');
      await import('./tier3-combinations/multi-category-cart.test.mjs');
      await import('./tier3-combinations/order-snapshot.test.mjs');
    }

    // Tier 4: Real-World Scenarios
    if (!targetTier || targetTier === '4') {
      console.log('--> Loading Tier 4: Real-World User Scenarios...');
      await import('./tier4-scenarios/e2e-checkout-journey.test.mjs');
    }
  } catch (err) {
    console.error('Fatal error loading test suites:', err);
    process.exit(1);
  }

  const passed = registry.printSummary();

  if (!passed) {
    process.exit(1);
  }

  if (isStrict && registry.totalSkipped > 0) {
    console.error(`\nSTRICT FAILURE: ${registry.totalSkipped} milestone test(s) are still pending.`);
    process.exit(1);
  }

  process.exit(0);
}

runSuite().catch((err) => {
  console.error('Unhandled test suite exception:', err);
  process.exit(1);
});

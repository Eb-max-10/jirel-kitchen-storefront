/**
 * M1 Challenger Catalog Adapter Dual-Mode Stress Test
 */

import {
  getAllProducts,
  getProductBySlug,
  getProductById,
  getProductsByCategory,
  getFeaturedProduct,
  getBestSellerProducts,
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  getActivePromo,
  products,
  categories,
  activePromo,
} from '../src/lib/catalog.ts';

import { isSupabaseConfigured } from '../src/lib/supabase.ts';

async function testCatalogAdapter() {
  console.log('============================================================');
  console.log('   M1 CATALOG ADAPTER DUAL-MODE STRESS TEST                 ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${message}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${message}`);
    }
  }

  // 1. Environmental Guard Check
  assert(isSupabaseConfigured() === false, 'isSupabaseConfigured() returns false when env variables are absent/placeholders');

  // 2. Synchronous Mock Re-exports
  assert(Array.isArray(products) && products.length === 10, 'Static products export has 10 items');
  assert(Array.isArray(categories) && categories.length === 6, 'Static categories export has 6 items');
  assert(activePromo && activePromo.id === 'promo-1', 'Static activePromo export has id promo-1');
  assert('code' in activePromo === false, 'Notice: Promo interface in src/data/promo.ts currently omits code property');

  // 3. Async API in Offline Fallback Mode
  const allProds = await getAllProducts();
  assert(Array.isArray(allProds) && allProds.length === 10, 'getAllProducts() returns 10 products in fallback mode');

  const slugProd = await getProductBySlug('the-always-pan');
  assert(slugProd && slugProd.id === 'prod-1', 'getProductBySlug("the-always-pan") resolves prod-1');

  const invalidSlug = await getProductBySlug('non-existent-slug-xyz');
  assert(invalidSlug === undefined, 'getProductBySlug("non-existent-slug-xyz") returns undefined');

  const idProd = await getProductById('prod-2');
  assert(idProd && idProd.slug === 'cast-iron-skillet', 'getProductById("prod-2") resolves cast-iron-skillet');

  const invalidId = await getProductById('prod-999');
  assert(invalidId === undefined, 'getProductById("prod-999") returns undefined');

  const catProds = await getProductsByCategory('pots-pans');
  assert(Array.isArray(catProds) && catProds.length === 3, 'getProductsByCategory("pots-pans") returns 3 products');

  const featured = await getFeaturedProduct();
  assert(featured && featured.isFeatured === true, 'getFeaturedProduct() returns a featured product');

  const bestSellers = await getBestSellerProducts();
  assert(Array.isArray(bestSellers) && bestSellers.length > 0 && bestSellers.every(p => p.isBestSeller), 'getBestSellerProducts() returns only best-sellers');

  const allCats = await getAllCategories();
  assert(Array.isArray(allCats) && allCats.length === 6, 'getAllCategories() returns 6 categories');

  const catBySlug = await getCategoryBySlug('knives');
  assert(catBySlug && catBySlug.id === 'knives', 'getCategoryBySlug("knives") resolves knives category');

  const catById = await getCategoryById('appliances');
  assert(catById && catById.slug === 'appliances', 'getCategoryById("appliances") resolves appliances category');

  const promo = await getActivePromo();
  assert(promo && promo.isActive === true, 'getActivePromo() resolves active promo');

  // 4. Variant and Image Referential Completeness
  for (const p of allProds) {
    assert(p.variants.length > 0, `Product ${p.id} has variants (${p.variants.length})`);
    assert(p.images.length > 0, `Product ${p.id} has images (${p.images.length})`);
    assert(typeof p.basePrice === 'number' && p.basePrice > 0, `Product ${p.id} basePrice is positive number`);
    if (p.salePrice !== undefined) {
      assert(typeof p.salePrice === 'number' && p.salePrice <= p.basePrice, `Product ${p.id} salePrice <= basePrice`);
    }
  }

  console.log('\n============================================================');
  console.log(`   CATALOG ADAPTER TEST SUMMARY                             `);
  console.log(`   Passed: ${passed} | Failed: ${failed}                   `);
  console.log('============================================================');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

testCatalogAdapter().catch(err => {
  console.error('Fatal error in catalog adapter test:', err);
  process.exit(1);
});

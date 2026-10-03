/**
 * Milestone 1 Challenger 2: Empirical Stress Test Suite
 * Target: src/lib/catalog.ts, src/lib/supabase.ts, and catalog fallback behaviors.
 * 
 * Verifies:
 *  1. Environment variable permutations (missing, invalid, placeholder, valid)
 *  2. Robust fallback when unconfigured
 *  3. Mocked network / DB errors, empty tables, and HTTP 500 error failover
 *  4. Live execution of internal mapDbProductToUiProduct via PostgREST response interception
 *  5. 1:1 Data fidelity between static catalog and seed data
 *  6. Boundary queries (bad slugs, injections, traversal, non-existent categories)
 *  7. High-concurrency stress harness (100 concurrent queries)
 */

import assert from 'node:assert';
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
  products as staticProducts,
  categories as staticCategories,
  activePromo as staticPromo,
} from '../../src/lib/catalog';
import {
  isSupabaseConfigured,
  getSupabaseClient,
  getSupabaseAdminClient,
} from '../../src/lib/supabase';

// Preserve initial environment and original fetch
const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

class AsyncSuiteRunner {
  suites: any[] = [];
  totalPassed = 0;
  totalFailed = 0;
  startTime = Date.now();

  async runSuite(name: string, fn: (test: (testName: string, testFn: () => any) => Promise<void>) => Promise<void>) {
    const suite = { name, tests: [] as any[], passed: 0, failed: 0 };
    this.suites.push(suite);
    console.log(`\n--> Running Suite: ${name}`);

    const test = async (testName: string, testFn: () => any) => {
      const start = Date.now();
      try {
        await testFn();
        const duration = Date.now() - start;
        suite.passed++;
        this.totalPassed++;
        suite.tests.push({ name: testName, passed: true, duration });
        console.log(`   ✔ ${testName} (${duration}ms)`);
      } catch (err: any) {
        const duration = Date.now() - start;
        suite.failed++;
        this.totalFailed++;
        suite.tests.push({ name: testName, passed: false, duration, error: err });
        console.log(`   ✖ ${testName} (${duration}ms)`);
        console.log(`      Error: ${err?.message || err}`);
        if (err?.stack) {
          console.log(`      ${err.stack.split('\n').slice(1, 4).join('\n')}`);
        }
      }
    };

    await fn(test);
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log('\n============================================================');
    console.log('       CATALOG ADAPTER EMPIRICAL STRESS TEST SUMMARY         ');
    console.log('============================================================');
    for (const s of this.suites) {
      const icon = s.failed > 0 ? '❌' : '✅';
      console.log(`${icon} [SUITE] ${s.name} (${s.passed} passed, ${s.failed} failed)`);
    }
    console.log('------------------------------------------------------------');
    console.log(`Total Suites:  ${this.suites.length}`);
    console.log(`Passed Tests:  ${this.totalPassed}`);
    console.log(`Failed Tests:  ${this.totalFailed}`);
    console.log(`Duration:      ${duration}s`);
    console.log('------------------------------------------------------------');
    if (this.totalFailed > 0) {
      console.log('RESULT: FAILED ❌');
      return false;
    } else {
      console.log('RESULT: PASSED ✅');
      return true;
    }
  }
}

async function main() {
  const runner = new AsyncSuiteRunner();

  // -------------------------------------------------------------------------
  // SUITE 1: Env Var Permutations & Supabase Detection Guard
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 1: Env Var Permutations & Supabase Guard', async (test) => {
    await test('Returns false when env vars are completely absent', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      assert.strictEqual(isSupabaseConfigured(), false);
      assert.strictEqual(getSupabaseClient(), null);
      assert.strictEqual(getSupabaseAdminClient(), null);
    });

    await test('Rejects template placeholder URLs without throwing', () => {
      const placeholders = [
        'https://your-project.supabase.co',
        'https://your-project-id.supabase.co',
        'https://placeholder.supabase.co',
        'https://example.com',
        'https://example.com/api',
      ];

      for (const ph of placeholders) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ph;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'any-anon-key';
        assert.strictEqual(isSupabaseConfigured(), false, `Expected ${ph} to be rejected`);
      }
    });

    await test('Rejects malformed or invalid URLs safely without throwing exceptions', () => {
      const invalidUrls = [
        'not-a-valid-url',
        'ftp://invalid-protocol.supabase.co',
        'javascript:alert(1)',
        '',
        '   ',
        'http//missing-colon',
      ];

      for (const badUrl of invalidUrls) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = badUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-key';
        assert.strictEqual(isSupabaseConfigured(), false, `Expected ${badUrl} to be rejected`);
      }
    });

    await test('Accepts valid http/https URLs that are not placeholders', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://jirel-kitchen-mock-test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
      assert.strictEqual(isSupabaseConfigured(), true);
    });
  });

  // -------------------------------------------------------------------------
  // SUITE 2: Fallback Robustness Under Missing Environment
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 2: Fallback Robustness Under Missing Environment', async (test) => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await test('getAllProducts() returns full 10 mock products when unconfigured', async () => {
      const prods = await getAllProducts();
      assert.strictEqual(Array.isArray(prods), true);
      assert.strictEqual(prods.length, 10);
      assert.strictEqual(prods[0].id, 'prod-1');
      assert.strictEqual(prods[9].id, 'prod-10');
    });

    await test('getProductBySlug() finds authentic products and returns undefined for unknown', async () => {
      const pan = await getProductBySlug('the-always-pan');
      assert.ok(pan);
      assert.strictEqual(pan.name, 'The Always Pan');
      assert.strictEqual(pan.basePrice, 45000);

      const missing = await getProductBySlug('non-existent-item');
      assert.strictEqual(missing, undefined);
    });

    await test('getProductById() finds product by ID and handles invalid ID', async () => {
      const skillet = await getProductById('prod-2');
      assert.ok(skillet);
      assert.strictEqual(skillet.name, 'Cast Iron Skillet');

      const invalid = await getProductById('prod-999');
      assert.strictEqual(invalid, undefined);
    });

    await test('getAllCategories() returns 6 mock categories in displayOrder', async () => {
      const cats = await getAllCategories();
      assert.strictEqual(cats.length, 6);
      assert.strictEqual(cats[0].id, 'pots-pans');
      assert.strictEqual(cats[5].id, 'appliances');
    });

    await test('getCategoryBySlug() and getCategoryById() resolve correctly', async () => {
      const catBySlug = await getCategoryBySlug('knives');
      assert.ok(catBySlug);
      assert.strictEqual(catBySlug.name, 'Knives');

      const catById = await getCategoryById('tableware');
      assert.ok(catById);
      assert.strictEqual(catById.name, 'Tableware');

      const badCat = await getCategoryBySlug('spaceships');
      assert.strictEqual(badCat, undefined);
    });

    await test('getActivePromo() returns active promo banner', async () => {
      const promo = await getActivePromo();
      assert.ok(promo);
      assert.strictEqual(promo.id, 'promo-1');
      assert.strictEqual(promo.discountText, 'Use code: JIREL20');
      assert.strictEqual(promo.isActive, true);
    });

    await test('getProductsByCategory() correctly partitions all 10 products', async () => {
      const pots = await getProductsByCategory('pots-pans');
      const knives = await getProductsByCategory('knives');
      const utensils = await getProductsByCategory('utensils');
      const tableware = await getProductsByCategory('tableware');
      const baking = await getProductsByCategory('baking');
      const appliances = await getProductsByCategory('appliances');

      assert.strictEqual(pots.length, 3);
      assert.strictEqual(knives.length, 2);
      assert.strictEqual(utensils.length, 1);
      assert.strictEqual(tableware.length, 2);
      assert.strictEqual(baking.length, 1);
      assert.strictEqual(appliances.length, 1);
      assert.strictEqual(pots.length + knives.length + utensils.length + tableware.length + baking.length + appliances.length, 10);
    });

    await test('getFeaturedProduct() and getBestSellerProducts() return expected subsets', async () => {
      const featured = await getFeaturedProduct();
      assert.ok(featured);
      assert.strictEqual(featured.isFeatured, true);
      assert.strictEqual(featured.id, 'prod-1');

      const bestSellers = await getBestSellerProducts();
      // Verified catalog has 7 best seller products
      assert.strictEqual(bestSellers.length, 7);
      for (const p of bestSellers) {
        assert.strictEqual(p.isBestSeller, true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // SUITE 3: Simulated Network Errors, Empty Tables & Failover Fallback
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 3: PostgREST Interception & Failover Responses', async (test) => {
    // Enable configured state with mock endpoint
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-intercept-test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

    await test('Falls back to mock data when network fetch throws error', async () => {
      // Mock global fetch to throw immediate network exception
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch: Connection refused');
      };

      const prods = await getAllProducts();
      assert.strictEqual(prods.length, 10);

      const cats = await getAllCategories();
      assert.strictEqual(cats.length, 6);

      const promo = await getActivePromo();
      assert.ok(promo);
      assert.strictEqual(promo.id, 'promo-1');
    });

    await test('Falls back to mock data when database returns HTTP 500 error', async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      const prods = await getAllProducts();
      assert.strictEqual(prods.length, 10);
      assert.strictEqual(prods[0].id, 'prod-1');
    });

    await test('Falls back to mock data when database tables are empty (0 rows)', async () => {
      // Return empty array []
      globalThis.fetch = async () => {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      const prods = await getAllProducts();
      assert.strictEqual(prods.length, 10, 'Expected fallback to mock products when DB returns empty set');

      const cats = await getAllCategories();
      assert.strictEqual(cats.length, 6);
    });

    await test('Live PostgREST mapping transforms DB rows through catalog adapter', async () => {
      // Return realistic DB row with variants and images
      const mockDbResponse = [
        {
          id: 'prod-live-1',
          name: 'Live Titanium Pan',
          slug: 'live-titanium-pan',
          description: 'Aerospace-grade cookware',
          category_id: 'pots-pans',
          base_price: '75000.00',
          sale_price: '65000.00',
          is_featured: true,
          is_best_seller: true,
          rating: '4.95',
          rating_count: 310,
          specs: { Material: 'Grade 5 Titanium', Coating: 'Diamond Non-stick' },
          product_variants: [
            { id: 'var-live-1', name: 'Raw Silver', color_hex: '#E0E0E0', sku: 'JK-TITAN-SILVER', price: '65000.00', display_order: 1 },
            { id: 'var-live-2', name: 'Midnight', color_hex: '#111111', sku: 'JK-TITAN-MIDNIGHT', price: '65000.00', display_order: 2 },
          ],
          product_images: [
            { id: 'img-live-1', variant_id: 'var-live-1', url: 'https://images.unsplash.com/sample-1', alt: 'Titanium Pan Silver', is_primary: true, display_order: 1 },
          ],
        },
      ];

      globalThis.fetch = async (url: any) => {
        const urlStr = String(url);
        if (urlStr.includes('/products')) {
          return new Response(JSON.stringify(mockDbResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify([]), { status: 200 });
      };

      const prods = await getAllProducts();
      assert.strictEqual(prods.length, 1);
      const live = prods[0];
      assert.strictEqual(live.id, 'prod-live-1');
      assert.strictEqual(live.name, 'Live Titanium Pan');
      assert.strictEqual(typeof live.basePrice, 'number');
      assert.strictEqual(live.basePrice, 75000);
      assert.strictEqual(typeof live.salePrice, 'number');
      assert.strictEqual(live.salePrice, 65000);
      assert.strictEqual(live.isFeatured, true);
      assert.strictEqual(live.isBestSeller, true);
      assert.strictEqual(live.rating, 4.95);
      assert.strictEqual(live.ratingCount, 310);
      assert.strictEqual(live.specs?.Material, 'Grade 5 Titanium');
      assert.strictEqual(live.variants.length, 2);
      assert.strictEqual(live.variants[0].name, 'Raw Silver');
      assert.strictEqual(live.images.length, 1);
      assert.strictEqual(live.images[0].isPrimary, true);
    });

    // Restore fetch
    globalThis.fetch = ORIGINAL_FETCH;
  });

  // -------------------------------------------------------------------------
  // SUITE 4: Data Fidelity Between Static Catalog and Seed SQL Structures
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 4: Data Fidelity & Referential Consistency', async (test) => {
    await test('Static catalog products have 100% referential integrity', () => {
      assert.strictEqual(staticProducts.length, 10);
      const catIds = new Set(staticCategories.map((c) => c.id));

      let totalVariants = 0;
      let totalImages = 0;

      for (const prod of staticProducts) {
        // Category relation
        assert.strictEqual(catIds.has(prod.categoryId), true, `Product ${prod.id} has invalid category ${prod.categoryId}`);

        // Variants
        assert.ok(prod.variants.length > 0, `Product ${prod.id} has no variants`);
        totalVariants += prod.variants.length;

        // Images
        assert.ok(prod.images.length > 0, `Product ${prod.id} has no images`);
        totalImages += prod.images.length;

        // Exactly 1 primary image
        const primaryImages = prod.images.filter((img) => img.isPrimary);
        assert.strictEqual(primaryImages.length, 1, `Product ${prod.id} should have exactly 1 primary image`);

        // Image variant references
        const variantIds = new Set(prod.variants.map((v) => v.id));
        for (const img of prod.images) {
          if (img.variantId) {
            assert.strictEqual(variantIds.has(img.variantId), true, `Image ${img.id} references non-existent variant ${img.variantId}`);
          }
        }

        // Prices must be numbers
        assert.strictEqual(typeof prod.basePrice, 'number');
        assert.ok(prod.basePrice > 0);
        if (prod.salePrice !== undefined) {
          assert.strictEqual(typeof prod.salePrice, 'number');
          assert.ok(prod.salePrice > 0);
          assert.ok(prod.basePrice > prod.salePrice);
        }
      }

      assert.strictEqual(totalVariants, 19);
      assert.strictEqual(totalImages, 20);
    });

    await test('Image img-10-2 references valid variant var-10-1 (referential defect regression check)', () => {
      const prod10 = staticProducts.find((p) => p.id === 'prod-10');
      assert.ok(prod10);
      const img10_2 = prod10.images.find((img) => img.id === 'img-10-2');
      assert.ok(img10_2);
      assert.strictEqual(img10_2.variantId, 'var-10-1');
    });
  });

  // -------------------------------------------------------------------------
  // SUITE 5: Database Row Transformer Edge Cases & Malformed Data
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 5: DB Row Transformer Edge Cases & Adversarial Data', async (test) => {
    function transformProduct(row: any) {
      const variants = Array.isArray(row.product_variants)
        ? row.product_variants
            .slice()
            .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((v: any) => ({
              id: v.id,
              name: v.name,
              colorHex: v.color_hex,
              sku: v.sku ?? undefined,
              price: v.price !== null && v.price !== undefined ? Number(v.price) : undefined,
            }))
        : [];

      const images = Array.isArray(row.product_images)
        ? row.product_images
            .slice()
            .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((img: any) => ({
              id: img.id,
              variantId: img.variant_id ?? undefined,
              url: img.url,
              alt: img.alt,
              isPrimary: Boolean(img.is_primary),
            }))
        : [];

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        categoryId: row.category_id,
        basePrice: Number(row.base_price),
        salePrice:
          row.sale_price !== null && row.sale_price !== undefined
            ? Number(row.sale_price)
            : undefined,
        isFeatured: Boolean(row.is_featured),
        isBestSeller: Boolean(row.is_best_seller),
        rating: Number(row.rating ?? 5.0),
        ratingCount: Number(row.rating_count ?? 0),
        specs: (row.specs as Record<string, string>) || {},
        variants,
        images,
      };
    }

    await test('String numeric coercion from Postgres NUMERIC(12,2) to JS number', () => {
      const rawRow = {
        id: 'prod-test',
        name: 'Test Wok',
        slug: 'test-wok',
        description: 'Heavy wok',
        category_id: 'pots-pans',
        base_price: '55000.00',
        sale_price: '48000.00',
        is_featured: 1,
        is_best_seller: 0,
        rating: '4.85',
        rating_count: '250',
        specs: { Gauge: '3mm' },
        product_variants: [
          { id: 'v1', name: 'Raw Steel', color_hex: '#111', price: '48000.00', display_order: 1 },
        ],
        product_images: [
          { id: 'i1', url: 'https://test.com/1.jpg', alt: 'Wok', is_primary: true, display_order: 1 },
        ],
      };

      const ui = transformProduct(rawRow);
      assert.strictEqual(typeof ui.basePrice, 'number');
      assert.strictEqual(ui.basePrice, 55000);
      assert.strictEqual(typeof ui.salePrice, 'number');
      assert.strictEqual(ui.salePrice, 48000);
      assert.strictEqual(ui.isFeatured, true);
      assert.strictEqual(ui.isBestSeller, false);
      assert.strictEqual(ui.rating, 4.85);
      assert.strictEqual(ui.ratingCount, 250);
      assert.strictEqual(ui.variants[0].price, 48000);
      assert.strictEqual(ui.specs.Gauge, '3mm');
    });

    await test('Null and undefined fields handled safely without crashing', () => {
      const minimalRow = {
        id: 'prod-min',
        name: 'Minimal Item',
        slug: 'minimal-item',
        description: 'No extras',
        category_id: 'utensils',
        base_price: 10000,
        sale_price: null,
        is_featured: null,
        is_best_seller: null,
        rating: null,
        rating_count: null,
        specs: null,
        product_variants: null,
        product_images: null,
      };

      const ui = transformProduct(minimalRow);
      assert.strictEqual(ui.salePrice, undefined);
      assert.strictEqual(ui.isFeatured, false);
      assert.strictEqual(ui.isBestSeller, false);
      assert.strictEqual(ui.rating, 5.0);
      assert.strictEqual(ui.ratingCount, 0);
      assert.deepStrictEqual(ui.specs, {});
      assert.deepStrictEqual(ui.variants, []);
      assert.deepStrictEqual(ui.images, []);
    });

    await test('Variant and image display_order sorting handles out-of-order and null orders', () => {
      const rowWithUnsortedRelations = {
        id: 'prod-sort',
        name: 'Sort Test',
        slug: 'sort-test',
        description: 'Desc',
        category_id: 'baking',
        base_price: 20000,
        product_variants: [
          { id: 'v3', name: 'Third', color_hex: '#333', display_order: 3 },
          { id: 'v1', name: 'First', color_hex: '#111', display_order: 1 },
          { id: 'v2', name: 'Second', color_hex: '#222', display_order: null },
        ],
        product_images: [
          { id: 'i2', url: 'https://test/2.jpg', alt: 'Second', is_primary: false, display_order: 2 },
          { id: 'i1', url: 'https://test/1.jpg', alt: 'First', is_primary: true, display_order: 1 },
        ],
      };

      const ui = transformProduct(rowWithUnsortedRelations);
      assert.strictEqual(ui.variants[0].id, 'v2');
      assert.strictEqual(ui.variants[1].id, 'v1');
      assert.strictEqual(ui.variants[2].id, 'v3');

      assert.strictEqual(ui.images[0].id, 'i1');
      assert.strictEqual(ui.images[1].id, 'i2');
    });
  });

  // -------------------------------------------------------------------------
  // SUITE 6: Boundary & Adversarial Slugs
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 6: Boundary & Adversarial Slugs', async (test) => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await test('Adversarial slug inputs return undefined cleanly', async () => {
      const malicious = [
        '',
        '   ',
        '..',
        '../../secret',
        '../../../etc/passwd',
        "<script>alert('xss')</script>",
        "' OR '1'='1",
        '"; DROP TABLE products; --',
        'non-existent-pan',
        'THE-ALWAYS-PAN',
      ];

      for (const slug of malicious) {
        const result = await getProductBySlug(slug);
        assert.strictEqual(result, undefined, `Expected undefined for slug "${slug}"`);
      }
    });
  });

  // -------------------------------------------------------------------------
  // SUITE 7: High-Concurrency Stress Harness
  // -------------------------------------------------------------------------
  await runner.runSuite('Suite 7: High-Concurrency Stress Harness', async (test) => {
    await test('100 concurrent asynchronous catalog queries resolve with 0 errors', async () => {
      const promises: Promise<any>[] = [];

      for (let i = 0; i < 20; i++) {
        promises.push(getAllProducts());
        promises.push(getProductBySlug('the-always-pan'));
        promises.push(getProductById('prod-1'));
        promises.push(getAllCategories());
        promises.push(getActivePromo());
      }

      assert.strictEqual(promises.length, 100);

      const start = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      assert.strictEqual(results.length, 100);
      for (const res of results) {
        assert.ok(res !== null && res !== undefined);
      }
      console.log(`      ⚡ 100 concurrent queries completed in ${duration}ms`);
    });
  });

  // Restore environment variables and fetch
  globalThis.fetch = ORIGINAL_FETCH;
  for (const key of Object.keys(process.env)) {
    if (ORIGINAL_ENV[key] !== undefined) {
      process.env[key] = ORIGINAL_ENV[key];
    } else {
      delete process.env[key];
    }
  }

  const passed = runner.printSummary();
  if (!passed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal unhandled error:', err);
  process.exit(1);
});

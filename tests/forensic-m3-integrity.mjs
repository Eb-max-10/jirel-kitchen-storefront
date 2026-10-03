/**
 * Forensic Integrity Verification Script for Milestone 3
 * Independent audit tests verifying dynamic routing, metadata generation, and zero facades.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { products } from '../src/data/products.ts';
import { siteConfig } from '../src/config/site.ts';
import {
  generateStaticParams,
  generateMetadata,
} from '../src/app/products/[slug]/page.tsx';

console.log('====================================================');
console.log('   M3 FORENSIC AUDITOR INDEPENDENT INTEGRITY TESTS  ');
console.log('====================================================\n');

async function runForensicAudit() {
  let passed = 0;
  let failed = 0;

  function check(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  async function checkAsync(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  console.log('--> 1. Testing generateStaticParams()...');
  await checkAsync('generateStaticParams returns exact 10 product slugs', async () => {
    const staticParams = await generateStaticParams();
    assert.strictEqual(Array.isArray(staticParams), true, 'Must return array');
    assert.strictEqual(staticParams.length, 10, 'Must have 10 slugs');
    const returnedSlugs = staticParams.map((p) => p.slug);
    const catalogSlugs = products.map((p) => p.slug);
    assert.deepStrictEqual(returnedSlugs.sort(), catalogSlugs.sort(), 'Slugs must match catalog exactly');
  });

  console.log('\n--> 2. Testing dynamic generateMetadata()...');
  for (const prod of products) {
    await checkAsync(`generateMetadata for slug "${prod.slug}" generates dynamic OpenGraph and Twitter cards`, async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ slug: prod.slug }) });
      assert.strictEqual(meta.title, `${prod.name} | ${siteConfig.name}`, 'Title must match product name + siteConfig');
      assert.strictEqual(meta.description, prod.description, 'Description must match product description');
      assert.strictEqual(meta.alternates?.canonical, `${siteConfig.url}/products/${prod.slug}`, 'Canonical URL must match');
      
      // OpenGraph
      assert.ok(meta.openGraph, 'OpenGraph must exist');
      assert.strictEqual(meta.openGraph.title, `${prod.name} | ${siteConfig.name}`);
      assert.strictEqual(meta.openGraph.description, prod.description);
      assert.strictEqual(meta.openGraph.url, `${siteConfig.url}/products/${prod.slug}`);
      assert.strictEqual(meta.openGraph.siteName, siteConfig.name);
      assert.strictEqual(meta.openGraph.locale, 'en_NG');
      assert.strictEqual(meta.openGraph.type, 'website');
      
      const primaryImage = prod.images.find((img) => img.isPrimary) || prod.images[0];
      if (primaryImage) {
        assert.ok(Array.isArray(meta.openGraph.images), 'OG images must be an array');
        assert.strictEqual(meta.openGraph.images[0].url, primaryImage.url);
        assert.strictEqual(meta.openGraph.images[0].width, 1200);
        assert.strictEqual(meta.openGraph.images[0].height, 630);
        assert.strictEqual(meta.openGraph.images[0].alt, prod.name);
      }

      // Twitter
      assert.ok(meta.twitter, 'Twitter card must exist');
      assert.strictEqual(meta.twitter.card, 'summary_large_image');
      assert.strictEqual(meta.twitter.title, `${prod.name} | ${siteConfig.name}`);
      if (primaryImage) {
        assert.deepStrictEqual(meta.twitter.images, [primaryImage.url]);
      }
    });
  }

  await checkAsync('generateMetadata for invalid slug returns safe 404 metadata', async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'totally-invalid-slug-999' }) });
    assert.strictEqual(meta.title, `Product Not Found | ${siteConfig.name}`);
    assert.ok(meta.description?.includes('not be located'));
  });

  console.log('\n--> 3. Source Code Forensic Inspection (Zero Hardcoding / Facades)...');
  const pagePath = path.resolve('src/app/products/[slug]/page.tsx');
  const pageSrc = fs.readFileSync(pagePath, 'utf8');

  check('page.tsx must NOT contain hardcoded product names as string literals', () => {
    assert.strictEqual(pageSrc.includes('"The Always Pan"'), false);
    assert.strictEqual(pageSrc.includes('"Cast Iron Skillet"'), false);
    assert.strictEqual(pageSrc.includes('"Stainless Steel Pot Set"'), false);
  });

  check('page.tsx must await params in both generateMetadata and ProductDetailPage', () => {
    const awaitParamsMatches = pageSrc.match(/await params/g);
    assert.ok(awaitParamsMatches && awaitParamsMatches.length >= 2, 'Must await params at least twice');
  });

  check('page.tsx calls notFound() for missing product', () => {
    assert.ok(pageSrc.includes('notFound()'));
  });

  const viewPath = path.resolve('src/components/product/ProductDetailView.tsx');
  const viewSrc = fs.readFileSync(viewPath, 'utf8');

  check('ProductDetailView.tsx has real useState and useCart wiring', () => {
    assert.ok(viewSrc.includes('useCart()'));
    assert.ok(viewSrc.includes('useState'));
    assert.ok(viewSrc.includes('addItem'));
    assert.ok(viewSrc.includes('openCart'));
    assert.ok(viewSrc.includes('getWhatsAppUrl'));
    assert.ok(viewSrc.includes('handleSelectVariant'));
    assert.ok(viewSrc.includes('handleSelectImage'));
  });

  check('ProductDetailView.tsx must NOT have facade empty functions', () => {
    assert.strictEqual(viewSrc.includes('() => {}'), false, 'No empty dummy callback stubs');
    assert.strictEqual(viewSrc.includes('return null;'), false, 'No dummy return null');
  });

  const cardPath = path.resolve('src/components/product/CookwareCard.tsx');
  const cardSrc = fs.readFileSync(cardPath, 'utf8');

  check('CookwareCard.tsx wraps image and title with Link to /products/${product.slug}', () => {
    assert.ok(cardSrc.includes('href={`/products/${product.slug}`'));
    assert.ok(cardSrc.includes('<Link'));
  });

  console.log('\n====================================================');
  console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runForensicAudit().catch((err) => {
  console.error('Forensic test runner crashed:', err);
  process.exit(1);
});

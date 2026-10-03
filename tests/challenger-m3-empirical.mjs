/**
 * M3 Challenger 1: Empirical Verification & Adversarial Stress Suite
 * Testing Dynamic Product Detail Pages (/products/[slug]), all 10 slugs,
 * 404 notFound behavior, OpenGraph / Twitter Social SEO, and Live HTTP serving.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { products } from '../src/data/products.ts';
import { categories } from '../src/data/categories.ts';
import { siteConfig, getWhatsAppUrl } from '../src/config/site.ts';

const pageModule = await import('../src/app/products/[slug]/page.tsx');
const ProductDetailPage =
  typeof pageModule.default === 'function'
    ? pageModule.default
    : pageModule.default?.default;
const generateStaticParams =
  pageModule.generateStaticParams || pageModule.default?.generateStaticParams;
const generateMetadata =
  pageModule.generateMetadata || pageModule.default?.generateMetadata;

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

async function runEmpiricalChallenge() {
  console.log('============================================================');
  console.log('   M3 CHALLENGER 1: EMPIRICAL HARNESS & ADVERSARIAL AUDIT   ');
  console.log('   Scope: Routes, 10 Slugs, 404 Behavior, OpenGraph SEO     ');
  console.log('============================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: Catalog Integrity & Static Params Oracle
  // ---------------------------------------------------------------------------
  console.log('--> Section 1: Catalog Integrity & generateStaticParams Oracle');

  assert(Array.isArray(products) && products.length === 10, 'Static catalog contains exactly 10 products', `Found ${products?.length}`);

  const staticParams = await generateStaticParams();
  assert(Array.isArray(staticParams), 'generateStaticParams() returns an array');
  assert(staticParams.length === 10, 'generateStaticParams() returns exactly 10 route params', `Got ${staticParams.length}`);

  const returnedSlugs = staticParams.map((p) => p.slug);
  const uniqueSlugs = new Set(returnedSlugs);
  assert(uniqueSlugs.size === 10, 'All 10 generated slugs are strictly unique');

  for (const prod of products) {
    assert(returnedSlugs.includes(prod.slug), `generateStaticParams includes slug: "${prod.slug}"`);
    assert(/^[a-z0-9-]+$/.test(prod.slug), `Slug "${prod.slug}" complies with kebab-case format`);
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: OpenGraph & Social SEO Metadata Generator Oracle
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 2: OpenGraph & Social SEO Metadata Verification (WhatsApp / Twitter)');

  for (const prod of products) {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: prod.slug }) });

    // Page title and description
    assert(typeof meta.title === 'string' && meta.title.includes(prod.name), `Metadata title for "${prod.slug}" contains product name`);
    assert(typeof meta.title === 'string' && meta.title.includes(siteConfig.name), `Metadata title for "${prod.slug}" contains site name`);
    assert(meta.description === prod.description, `Metadata description matches product description for "${prod.slug}"`);

    // Canonical URL
    const expectedCanonical = `${siteConfig.url}/products/${prod.slug}`;
    assert(meta.alternates?.canonical === expectedCanonical, `Canonical URL matches "${expectedCanonical}"`);

    // OpenGraph specification for social cards (WhatsApp, Facebook)
    const og = meta.openGraph;
    assert(Boolean(og), `OpenGraph object is present for "${prod.slug}"`);
    assert(og?.title === `${prod.name} | ${siteConfig.name}`, `og:title correctly formatted for "${prod.slug}"`);
    assert(og?.description === prod.description, `og:description correctly formatted for "${prod.slug}"`);
    assert(og?.url === expectedCanonical, `og:url matches canonical for "${prod.slug}"`);
    assert(og?.siteName === siteConfig.name, `og:siteName matches siteConfig.name for "${prod.slug}"`);
    assert(og?.locale === 'en_NG', `og:locale is en_NG for "${prod.slug}"`);
    assert(og?.type === 'website', `og:type is website for "${prod.slug}"`);

    // Image specification (WhatsApp preview requires valid image URL, recommended 1200x630)
    assert(Array.isArray(og?.images) && og.images.length > 0, `og:images contains at least one image for "${prod.slug}"`);
    const primaryImg = og?.images?.[0];
    assert(typeof primaryImg?.url === 'string' && primaryImg.url.startsWith('https://'), `og:image URL is absolute HTTPS for "${prod.slug}"`);
    assert(primaryImg?.width === 1200 && primaryImg?.height === 630, `og:image dimensions are 1200x630 for high-res WhatsApp preview`);
    assert(primaryImg?.alt === prod.name, `og:image alt matches product name`);

    // Twitter Card
    const tw = meta.twitter;
    assert(tw?.card === 'summary_large_image', `twitter:card is summary_large_image for "${prod.slug}"`);
    assert(tw?.title === `${prod.name} | ${siteConfig.name}`, `twitter:title is correct for "${prod.slug}"`);
    assert(Array.isArray(tw?.images) && tw.images.length > 0, `twitter:images contains image for "${prod.slug}"`);
  }

  // ---------------------------------------------------------------------------
  // SECTION 3: Metadata Fallback for Non-Existent Slugs
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 3: Metadata Fallback on Non-Existent & Adversarial Slugs');

  const invalidMeta = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent-product' }) });
  assert(invalidMeta.title?.includes('Product Not Found'), 'Metadata for invalid slug returns "Product Not Found" title');
  assert(typeof invalidMeta.description === 'string' && invalidMeta.description.length > 0, 'Metadata for invalid slug provides description');

  // ---------------------------------------------------------------------------
  // SECTION 4: ProductDetailPage Component & notFound() Oracle
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 4: ProductDetailPage Component & notFound() Oracle');

  for (const prod of products) {
    try {
      const pageEl = await ProductDetailPage({ params: Promise.resolve({ slug: prod.slug }) });
      assert(Boolean(pageEl), `ProductDetailPage renders successfully for "${prod.slug}"`);
      assert(pageEl.type === 'main', `ProductDetailPage returns <main> root wrapper for "${prod.slug}"`);
    } catch (err) {
      assert(false, `ProductDetailPage threw unexpected error for valid slug "${prod.slug}": ${err.message}`);
    }
  }

  // Adversarial slugs that must invoke notFound()
  const adversarialSlugs = [
    'non-existent-cookware-item',
    'the-never-pan',
    'THE-ALWAYS-PAN',           // uppercase case-sensitivity
    'Cast-Iron-Skillet',        // mixed case
    '..',                       // path traversal
    '../../etc/passwd',         // nested path traversal
    '..\\..\\windows\\win.ini',  // windows traversal
    '<script>alert(1)</script>',// XSS attempt
    "' OR '1'='1",              // SQLi attempt
    '"; DROP TABLE products; --',
    'the-always-pan/sub-path',
    '   ',                      // whitespace
    '🍳-african-pot',           // unicode/emoji
    '123456789',                // numeric
  ];

  for (const badSlug of adversarialSlugs) {
    try {
      await ProductDetailPage({ params: Promise.resolve({ slug: badSlug }) });
      assert(false, `Adversarial slug "${badSlug}" should have called notFound() but did not throw`);
    } catch (err) {
      // In Next.js 16, notFound() throws NEXT_HTTP_ERROR_FALLBACK;404 (digest or message)
      const errStr = String(err?.digest || err?.message || err);
      const isNotFound =
        errStr.includes('NEXT_NOT_FOUND') ||
        errStr.includes('NEXT_HTTP_ERROR_FALLBACK;404') ||
        errStr.includes('404');
      assert(isNotFound, `Adversarial slug "${badSlug}" correctly triggers notFound() error`, `Threw: ${errStr}`);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 5: Prerendered Static HTML Artifact Audit (.next/server/app/products)
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 5: Static SSG HTML File Inspection');

  const productsDir = path.join(process.cwd(), '.next', 'server', 'app', 'products');
  assert(fs.existsSync(productsDir), '.next/server/app/products directory exists');

  for (const prod of products) {
    const htmlFile = path.join(productsDir, `${prod.slug}.html`);
    const fileExists = fs.existsSync(htmlFile);
    assert(fileExists, `Prerendered HTML file exists for "${prod.slug}"`);

    if (fileExists) {
      const htmlContent = fs.readFileSync(htmlFile, 'utf8');
      const sizeKb = (htmlContent.length / 1024).toFixed(1);
      assert(htmlContent.length > 40000, `HTML file for "${prod.slug}" has complete payload (${sizeKb} KB)`);

      // Meta tags audit
      assert(htmlContent.includes(`<title>${prod.name} | ${siteConfig.name}</title>`), `HTML contains exact <title> for "${prod.slug}"`);
      assert(htmlContent.includes(`property="og:title" content="${prod.name} | ${siteConfig.name}"`), `HTML contains og:title for "${prod.slug}"`);
      assert(htmlContent.includes(`property="og:url" content="${siteConfig.url}/products/${prod.slug}"`), `HTML contains og:url for "${prod.slug}"`);
      assert(htmlContent.includes(`name="twitter:card" content="summary_large_image"`), `HTML contains twitter:card summary_large_image for "${prod.slug}"`);

      // WhatsApp concierge button and link format
      assert(htmlContent.includes('wa.me/'), `HTML contains WhatsApp concierge trigger for "${prod.slug}"`);
      assert(htmlContent.includes('Order via WhatsApp Concierge'), `HTML contains "Order via WhatsApp Concierge" label for "${prod.slug}"`);

      // Product details and interactive sections
      assert(htmlContent.includes('Add to Cart'), `HTML contains "Add to Cart" button for "${prod.slug}"`);
      assert(htmlContent.includes('Product Specifications'), `HTML contains "Product Specifications" tab for "${prod.slug}"`);
      assert(htmlContent.includes('Complete Your Kitchen'), `HTML contains related products section for "${prod.slug}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 6: Cross-Linking and Navigation Audit
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 6: Cross-Linking & Navigation Integration Audit');

  const cookwareCardPath = path.join(process.cwd(), 'src', 'components', 'product', 'CookwareCard.tsx');
  const cookwareCardSrc = fs.readFileSync(cookwareCardPath, 'utf8');
  assert(cookwareCardSrc.includes('href={`/products/${product.slug}`}'), 'CookwareCard contains Link referencing `/products/${product.slug}`');

  const headerPath = path.join(process.cwd(), 'src', 'components', 'layout', 'Header.tsx');
  const headerSrc = fs.readFileSync(headerPath, 'utf8');
  assert(headerSrc.includes('/#all-products'), 'Header navigation links point to `/#all-products` root anchor');
  assert(headerSrc.includes('/#best-sellers'), 'Header navigation links point to `/#best-sellers` root anchor');
  assert(headerSrc.includes('/#contact'), 'Header navigation links point to `/#contact` root anchor');

  // ---------------------------------------------------------------------------
  // SECTION 7: WhatsApp Concierge URL Formatting Edge Cases
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 7: WhatsApp Concierge URL Builder Stress Testing');

  // Verify that encoded messages generate valid URLs without breaking or truncation
  for (const prod of products) {
    for (const v of prod.variants) {
      const priceFormatted = `₦${(prod.salePrice ?? prod.basePrice).toLocaleString()}`;
      const msg = `Hi Jirel Kitchen, I would like to order:\n• Product: ${prod.name} (${v.name})\n• Quantity: 2\n• Total Price: ${priceFormatted}\n\nPlease confirm stock availability and delivery timeline for my location in Nigeria.`;
      const waUrl = getWhatsAppUrl(msg);

      assert(waUrl.startsWith('https://wa.me/2348000000000?text='), `WhatsApp URL format valid for "${prod.name}" (${v.name})`);
      assert(!waUrl.includes('undefined'), `WhatsApp URL does not contain undefined values for "${prod.name}"`);
      const extractedQuery = decodeURIComponent(waUrl.split('?text=')[1]);
      assert(extractedQuery === msg, `WhatsApp URL message round-trip encoding is loss-free for "${prod.name}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 8: Live HTTP Execution via `next start`
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 8: Live HTTP Execution (Testing HTTP 200 and 404 Status Codes)');

  const PORT = 3005;
  const BASE_URL = `http://localhost:${PORT}`;

  console.log(`  Starting Next.js production server on port ${PORT}...`);
  const serverProcess = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore',
  });

  // Helper to fetch HTTP status and headers
  function httpGet(urlPath) {
    return new Promise((resolve, reject) => {
      const req = http.get(`${BASE_URL}${urlPath}`, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('HTTP request timeout'));
      });
    });
  }

  // Wait for server to become responsive
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await httpGet('/');
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {
      // Keep waiting
    }
  }

  assert(serverReady, `Next.js production server is live on port ${PORT}`);

  if (serverReady) {
    // Test all 10 product routes live
    for (const prod of products) {
      try {
        const res = await httpGet(`/products/${prod.slug}`);
        assert(res.status === 200, `Live HTTP 200 OK for /products/${prod.slug}`);
        assert(res.headers['content-type']?.includes('text/html'), `Content-Type is text/html for /products/${prod.slug}`);
        assert(res.body.includes(prod.name), `Response body contains product name for /products/${prod.slug}`);
        assert(res.body.includes('property="og:title"'), `Response body contains og:title for /products/${prod.slug}`);
      } catch (err) {
        assert(false, `Failed live request for /products/${prod.slug}: ${err.message}`);
      }
    }

    // Test non-existent slugs return HTTP 404
    const live404Slugs = [
      'non-existent-product',
      'golden-teapot',
      'the-never-pan',
      'unknown-skillet-12345',
      'non-existent-utensils',
    ];

    for (const badSlug of live404Slugs) {
      try {
        const res = await httpGet(`/products/${badSlug}`);
        assert(res.status === 404, `Live HTTP 404 Not Found for /products/${badSlug} (got ${res.status})`);
      } catch (err) {
        assert(false, `Failed live request for /products/${badSlug}: ${err.message}`);
      }
    }
  }

  // Gracefully terminate the server process
  if (serverProcess) {
    if (process.platform === 'win32') {
      try {
        // In Windows, spawn with shell: true creates a process tree
        spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t']);
      } catch {
        serverProcess.kill('SIGKILL');
      }
    } else {
      serverProcess.kill('SIGTERM');
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`TOTAL TESTS:   ${results.total}`);
  console.log(`PASSED:        ${results.passed}`);
  console.log(`FAILED:        ${results.failed}`);
  console.log('============================================================');

  if (results.failed === 0) {
    console.log('\nALL EMPIRICAL CHALLENGER TESTS PASSED SUCCESSFULLY! ✅\n');
    process.exit(0);
  } else {
    console.error(`\n${results.failed} EMPIRICAL CHALLENGER TEST(S) FAILED! ❌\n`);
    process.exit(1);
  }
}

runEmpiricalChallenge().catch((err) => {
  console.error('Fatal unhandled error in challenge suite:', err);
  process.exit(1);
});

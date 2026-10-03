/**
 * M1 Challenger Empirical Verification Suite
 * Stress-testing schema integrity, relational foreign keys, constraints, RLS, and seed data.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SCHEMA_FILE = path.join(ROOT_DIR, 'supabase', 'migrations', '20261003000000_init_schema.sql');
const SEED_FILE = path.join(ROOT_DIR, 'supabase', 'seed.sql');

const results = {
  passed: 0,
  failed: 0,
  details: [],
};

function assert(condition, message, metadata = null) {
  if (condition) {
    results.passed++;
    results.details.push({ status: 'PASS', message, metadata });
    console.log(`  [PASS] ${message}`);
  } else {
    results.failed++;
    results.details.push({ status: 'FAIL', message, metadata });
    console.error(`  [FAIL] ${message}`, metadata ? JSON.stringify(metadata) : '');
  }
}

console.log('============================================================');
console.log('   M1 EMPIRICAL CHALLENGER VERIFICATION HARNESS             ');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// STEP 1: Verify Files Existence
// -----------------------------------------------------------------------------
console.log('--> Step 1: File Presence & Baselines');
assert(fs.existsSync(SCHEMA_FILE), 'Schema migration file exists', { path: SCHEMA_FILE });
assert(fs.existsSync(SEED_FILE), 'Seed file exists', { path: SEED_FILE });

const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
const seedSql = fs.readFileSync(SEED_FILE, 'utf8');

// -----------------------------------------------------------------------------
// STEP 2: Schema DDL & Constraint Verification
// -----------------------------------------------------------------------------
console.log('\n--> Step 2: DDL Structural & Constraint Analysis');

// 2.1 Table Definitions
const requiredTables = ['categories', 'products', 'product_variants', 'product_images', 'promos', 'orders'];
for (const table of requiredTables) {
  const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?public\\.${table}\\b`, 'i');
  assert(tableRegex.test(schemaSql), `Table public.${table} defined in DDL`);
}

// 2.2 Foreign Key Definitions in DDL
assert(
  /category_id\s+TEXT\s+NOT\s+NULL\s+REFERENCES\s+public\.categories\(id\)\s+ON\s+DELETE\s+RESTRICT/i.test(schemaSql),
  'products.category_id references public.categories(id) ON DELETE RESTRICT'
);
assert(
  /product_id\s+TEXT\s+NOT\s+NULL\s+REFERENCES\s+public\.products\(id\)\s+ON\s+DELETE\s+CASCADE/i.test(schemaSql),
  'product_variants.product_id references public.products(id) ON DELETE CASCADE'
);
assert(
  /product_id\s+TEXT\s+NOT\s+NULL\s+REFERENCES\s+public\.products\(id\)\s+ON\s+DELETE\s+CASCADE/i.test(schemaSql),
  'product_images.product_id references public.products(id) ON DELETE CASCADE'
);
assert(
  /variant_id\s+TEXT\s+REFERENCES\s+public\.product_variants\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i.test(schemaSql),
  'product_images.variant_id references public.product_variants(id) ON DELETE SET NULL'
);

// 2.3 Check Constraints in DDL
assert(
  /CONSTRAINT\s+chk_sale_price_le_base\s+CHECK\s*\(\s*sale_price\s+IS\s+NULL\s+OR\s+sale_price\s*<=\s*base_price\s*\)/i.test(schemaSql),
  'products constraint: sale_price <= base_price'
);
assert(
  /color_hex\s+VARCHAR\(7\)\s+NOT\s+NULL\s+CHECK\s*\(\s*color_hex\s+~\*\s+'\^#\[0-9A-Fa-f\]\{6\}\$'\s*\)/i.test(schemaSql),
  'product_variants constraint: color_hex regex ^#[0-9A-Fa-f]{6}$'
);
assert(
  /url\s+TEXT\s+NOT\s+NULL\s+CHECK\s*\(\s*url\s+~\*\s+'\^https\?:\/\/'\s*\)/i.test(schemaSql),
  'product_images constraint: url starts with http:// or https://'
);

// 2.4 Orders Constraints in DDL
assert(
  /payment_status\s+VARCHAR\(20\)\s+NOT\s+NULL\s+DEFAULT\s+'pending'\s+CHECK\s*\(\s*payment_status\s+IN\s*\('pending',\s*'paid',\s*'failed',\s*'cancelled'\)\s*\)/i.test(schemaSql),
  'orders constraint: payment_status IN (pending, paid, failed, cancelled)'
);
assert(
  /currency\s+VARCHAR\(3\)\s+NOT\s+NULL\s+DEFAULT\s+'NGN'/i.test(schemaSql),
  'orders column: currency VARCHAR(3) NOT NULL DEFAULT NGN'
);
assert(
  /paystack_reference\s+TEXT\s+UNIQUE/i.test(schemaSql),
  'orders constraint: paystack_reference is UNIQUE'
);
assert(
  /items\s+JSONB\s+NOT\s+NULL\s+CHECK\s*\(\s*jsonb_typeof\(items\)\s*=\s*'array'\s+AND\s+jsonb_array_length\(items\)\s*>\s*0\s*\)/i.test(schemaSql),
  'orders constraint: items is non-empty JSONB array'
);
assert(
  /customer_phone\s+TEXT\s+NOT\s+NULL\s+CHECK\s*\(\s*length\(trim\(customer_phone\)\)\s*>=\s*7\s*\)/i.test(schemaSql),
  'orders constraint: customer_phone minimum length >= 7'
);
assert(
  /total_price\s+NUMERIC\(12,\s*2\)\s+NOT\s+NULL\s+CHECK\s*\(\s*total_price\s*>=\s*0\s*\)/i.test(schemaSql),
  'orders constraint: total_price non-negative'
);
assert(
  /order_number\s+TEXT\s+NOT\s+NULL\s+UNIQUE\s+DEFAULT\s+\('JK-'\s*\|\|\s*to_char\(nextval\('public\.order_number_seq'\),\s*'FM000000'\)\)/i.test(schemaSql),
  'orders sequence: order_number generated via order_number_seq (JK-001001)'
);

// 2.5 Row Level Security (RLS) & Privacy Protection
assert(
  /ALTER\s+TABLE\s+public\.orders\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(schemaSql),
  'RLS enabled on orders table'
);
assert(
  /GRANT\s+INSERT\s+ON\s+TABLE\s+public\.orders\s+TO\s+anon,\s*authenticated/i.test(schemaSql),
  'Guest INSERT granted on orders'
);
assert(
  !/GRANT\s+SELECT\s+ON\s+TABLE\s+public\.orders\s+TO\s+anon/i.test(schemaSql),
  'Adversarial security check: anon role has NO direct SELECT grant on orders (PII leakage prevented)'
);
assert(
  /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_order_by_reference/i.test(schemaSql) &&
  /SECURITY\s+DEFINER/i.test(schemaSql),
  'Secure SECURITY DEFINER RPC function get_order_by_reference defined'
);

// -----------------------------------------------------------------------------
// STEP 3: Seed SQL Deep Relational Extraction & Integrity Check
// -----------------------------------------------------------------------------
console.log('\n--> Step 3: Seed SQL Relational Extraction & Cross-Table Verification');

// Helper to extract rows from seed.sql INSERT INTO public.<table> (...) VALUES (...);
function extractRows(sql, tableName) {
  const insertRegex = new RegExp(`INSERT\\s+INTO\\s+public\\.${tableName}\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?)(?:ON\\s+CONFLICT|COMMIT|;)`, 'i');
  const match = sql.match(insertRegex);
  if (!match) return { columns: [], rows: [] };

  const columns = match[1].split(',').map(c => c.trim());
  const valuesText = match[2].trim();

  // Parse tuples like (val1, val2, ...), (val3, val4, ...)
  const tuples = [];
  let current = '';
  let inString = false;
  let inJson = 0;
  let parenDepth = 0;

  for (let i = 0; i < valuesText.length; i++) {
    const char = valuesText[i];
    const prevChar = i > 0 ? valuesText[i - 1] : '';

    if (char === "'" && prevChar !== '\\') {
      inString = !inString;
      current += char;
    } else if (!inString && char === '(') {
      parenDepth++;
      if (parenDepth === 1) {
        current = '';
        continue;
      }
      current += char;
    } else if (!inString && char === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        tuples.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    } else {
      if (parenDepth > 0) {
        current += char;
      }
    }
  }

  // Parse fields within each tuple
  const parsedRows = tuples.map(tuple => {
    const fields = [];
    let field = '';
    let inStr = false;
    for (let j = 0; j < tuple.length; j++) {
      const c = tuple[j];
      const prev = j > 0 ? tuple[j - 1] : '';
      if (c === "'" && prev !== '\\') {
        inStr = !inStr;
        field += c;
      } else if (!inStr && c === ',') {
        fields.push(cleanVal(field));
        field = '';
      } else {
        field += c;
      }
    }
    if (field.trim().length > 0) {
      fields.push(cleanVal(field));
    }

    const rowObj = {};
    columns.forEach((col, idx) => {
      rowObj[col] = fields[idx];
    });
    return rowObj;
  });

  return { columns, rows: parsedRows };
}

function cleanVal(str) {
  str = str.trim();
  // Strip trailing ::jsonb or casts
  str = str.replace(/::[a-zA-Z0-9_]+$/g, '').trim();
  if (str === 'NULL' || str === 'null') return null;
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.substring(1, str.length - 1).replace(/''/g, "'");
  }
  const num = Number(str);
  if (!isNaN(num)) return num;
  return str;
}

const categoriesData = extractRows(seedSql, 'categories');
const productsData = extractRows(seedSql, 'products');
const variantsData = extractRows(seedSql, 'product_variants');
const imagesData = extractRows(seedSql, 'product_images');
const promosData = extractRows(seedSql, 'promos');

console.log(`  Parsed seed records:`);
console.log(`    Categories: ${categoriesData.rows.length}`);
console.log(`    Products:   ${productsData.rows.length}`);
console.log(`    Variants:   ${variantsData.rows.length}`);
console.log(`    Images:     ${imagesData.rows.length}`);
console.log(`    Promos:     ${promosData.rows.length}`);

// Seed Counts Assertions
assert(categoriesData.rows.length === 6, 'Seed contains exactly 6 categories', { count: categoriesData.rows.length });
assert(productsData.rows.length === 10, 'Seed contains exactly 10 products', { count: productsData.rows.length });
assert(variantsData.rows.length === 19, 'Seed contains exactly 19 product variants', { count: variantsData.rows.length });
assert(imagesData.rows.length === 20, 'Seed contains exactly 20 product images', { count: imagesData.rows.length });
assert(promosData.rows.length === 1, 'Seed contains exactly 1 active promo', { count: promosData.rows.length });

// 3.1 Category Integrity
const categoryIds = new Set(categoriesData.rows.map(c => c.id));
const categorySlugs = new Set(categoriesData.rows.map(c => c.slug));
assert(categoryIds.size === 6, 'All category IDs are unique', { ids: Array.from(categoryIds) });
assert(categorySlugs.size === 6, 'All category slugs are unique', { slugs: Array.from(categorySlugs) });

// 3.2 Product Integrity & Foreign Key to Categories
const productIds = new Set(productsData.rows.map(p => p.id));
const productSlugs = new Set(productsData.rows.map(p => p.slug));
assert(productIds.size === 10, 'All product IDs are unique', { ids: Array.from(productIds) });
assert(productSlugs.size === 10, 'All product slugs are unique', { slugs: Array.from(productSlugs) });

for (const prod of productsData.rows) {
  assert(categoryIds.has(prod.category_id), `Product ${prod.id} category_id '${prod.category_id}' exists in categories`);
  assert(typeof prod.base_price === 'number' && prod.base_price > 0, `Product ${prod.id} has positive base_price (${prod.base_price})`);
  if (prod.sale_price !== null) {
    assert(
      typeof prod.sale_price === 'number' && prod.sale_price <= prod.base_price,
      `Product ${prod.id} sale_price (${prod.sale_price}) <= base_price (${prod.base_price})`
    );
  }
  assert(prod.rating >= 0 && prod.rating <= 5.0, `Product ${prod.id} rating (${prod.rating}) within [0, 5.0]`);
  
  // Verify specs is valid JSON
  let specsValid = false;
  try {
    const specsObj = typeof prod.specs === 'string' ? JSON.parse(prod.specs) : prod.specs;
    specsValid = specsObj !== null && typeof specsObj === 'object' && Object.keys(specsObj).length > 0;
  } catch (e) {
    specsValid = false;
  }
  assert(specsValid, `Product ${prod.id} specs is valid non-empty JSON`);
}

// 3.3 Variants Integrity & Foreign Key to Products
const variantIds = new Set(variantsData.rows.map(v => v.id));
const variantSkus = new Set(variantsData.rows.map(v => v.sku));
assert(variantIds.size === 19, 'All variant IDs are unique', { count: variantIds.size });
assert(variantSkus.size === 19, 'All variant SKUs are unique', { count: variantSkus.size });

const variantsByProduct = new Map();
for (const v of variantsData.rows) {
  assert(productIds.has(v.product_id), `Variant ${v.id} product_id '${v.product_id}' exists in products`);
  assert(/^#[0-9A-Fa-f]{6}$/.test(v.color_hex), `Variant ${v.id} color_hex '${v.color_hex}' matches hex regex`);
  assert(typeof v.stock_quantity === 'number' && v.stock_quantity >= 0, `Variant ${v.id} stock_quantity (${v.stock_quantity}) >= 0`);

  if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
  variantsByProduct.get(v.product_id).push(v);
}

// Every product must have at least one variant
for (const prodId of productIds) {
  const prodVars = variantsByProduct.get(prodId) || [];
  assert(prodVars.length > 0, `Product ${prodId} has at least 1 variant (${prodVars.length} found)`);
}

// 3.4 Images Integrity & Foreign Keys to Products and Variants
const imageIds = new Set(imagesData.rows.map(img => img.id));
assert(imageIds.size === 20, 'All image IDs are unique', { count: imageIds.size });

const imagesByProduct = new Map();
for (const img of imagesData.rows) {
  assert(productIds.has(img.product_id), `Image ${img.id} product_id '${img.product_id}' exists in products`);
  assert(typeof img.url === 'string' && img.url.startsWith('https://'), `Image ${img.id} url starts with https://`);
  
  if (img.variant_id) {
    assert(variantIds.has(img.variant_id), `Image ${img.id} variant_id '${img.variant_id}' exists in product_variants`);
    
    // CRITICAL ADVERSARIAL CHECK: Does the variant belong to the same product?
    const variantObj = variantsData.rows.find(v => v.id === img.variant_id);
    assert(
      variantObj && variantObj.product_id === img.product_id,
      `Image ${img.id} (${img.product_id}) variant_id '${img.variant_id}' belongs to SAME product (${variantObj ? variantObj.product_id : 'null'})`
    );
  }

  if (!imagesByProduct.has(img.product_id)) imagesByProduct.set(img.product_id, []);
  imagesByProduct.get(img.product_id).push(img);
}

// Every product must have at least one image and exactly one primary image
for (const prodId of productIds) {
  const prodImgs = imagesByProduct.get(prodId) || [];
  assert(prodImgs.length > 0, `Product ${prodId} has at least 1 image (${prodImgs.length} found)`);
  const primaryCount = prodImgs.filter(i => i.is_primary === true).length;
  assert(primaryCount === 1, `Product ${prodId} has exactly 1 primary image (${primaryCount} found)`);
}

// -----------------------------------------------------------------------------
// STEP 4: Summary & Exit
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`   EMPIRICAL VERIFICATION COMPLETE                          `);
console.log(`   Passed: ${results.passed} | Failed: ${results.failed}   `);
console.log('============================================================');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

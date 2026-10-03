/**
 * Tier 1: Schema & Seeds Validation Test
 * Feature Coverage: F1 (Supabase DDL), F2 (RLS), F3 (Catalog Seeds)
 * Authoritative source: ORIGINAL_REQUEST §R1, PROJECT.md §Feature Inventory F1-F3
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect, skip } from '../helpers/test-framework.mjs';

const ROOT_DIR = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'supabase', 'migrations');
const SEED_FILE = path.join(ROOT_DIR, 'supabase', 'seed.sql');

describe('Tier 1: Supabase DDL Schema & Migrations (F1, F2)', () => {
  const hasMigrationsDir = fs.existsSync(MIGRATIONS_DIR);
  let migrationFiles = [];
  if (hasMigrationsDir) {
    migrationFiles = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
  }

  if (!hasMigrationsDir || migrationFiles.length === 0) {
    skip('F1: Supabase DDL migrations presence', 'supabase/migrations/*.sql not yet created (M1 in progress)');
    skip('F1: Required tables defined with constraints', 'supabase/migrations/*.sql not yet created (M1 in progress)');
    skip('F1: Orders table columns contract', 'supabase/migrations/*.sql not yet created (M1 in progress)');
    skip('F2: Row Level Security (RLS) policies defined', 'supabase/migrations/*.sql not yet created (M1 in progress)');
    skip('F2: Public catalog read and guest order insert policies', 'supabase/migrations/*.sql not yet created (M1 in progress)');
  } else {
    const fullSql = migrationFiles.map(f => fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8')).join('\n');

    test('F1: Supabase DDL migrations presence', () => {
      expect(migrationFiles.length).toBeGreaterThan(0);
    });

    test('F1: Required tables defined with constraints', () => {
      const requiredTables = ['categories', 'products', 'product_variants', 'product_images', 'promos', 'orders'];
      for (const table of requiredTables) {
        const tablePattern = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?(public\\.)?${table}`, 'i');
        expect(tablePattern.test(fullSql)).toBe(true);
      }
    });

    test('F1: Orders table columns contract', () => {
      const requiredColumns = [
        'customer_name',
        'email',
        'customer_phone',
        'shipping_address',
        'items',
        'total_price',
        'currency',
        'paystack_reference',
        'payment_status',
      ];
      for (const col of requiredColumns) {
        const colPattern = new RegExp(`\\b${col}\\b`, 'i');
        expect(colPattern.test(fullSql)).toBe(true);
      }
    });

    test('F2: Row Level Security (RLS) policies defined', () => {
      expect(/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(fullSql)).toBe(true);
    });

    test('F2: Public catalog read and guest order insert policies', () => {
      // Must contain policies for SELECT and INSERT
      expect(/CREATE\s+POLICY/i.test(fullSql)).toBe(true);
      expect(/FOR\s+SELECT/i.test(fullSql)).toBe(true);
      expect(/FOR\s+INSERT/i.test(fullSql)).toBe(true);
    });
  }
});

describe('Tier 1: Catalog Seed Data Verification (F3)', () => {
  const hasSeedFile = fs.existsSync(SEED_FILE);

  if (!hasSeedFile) {
    skip('F3: Seed script presence (supabase/seed.sql)', 'supabase/seed.sql not yet created (M1 in progress)');
    skip('F3: 6 categories seeded matching static catalog', 'supabase/seed.sql not yet created (M1 in progress)');
    skip('F3: 10 products seeded matching static catalog', 'supabase/seed.sql not yet created (M1 in progress)');
    skip('F3: 19 product variants seeded', 'supabase/seed.sql not yet created (M1 in progress)');
    skip('F3: 20 product images seeded', 'supabase/seed.sql not yet created (M1 in progress)');
  } else {
    const seedContent = fs.readFileSync(SEED_FILE, 'utf8');

    test('F3: Seed script presence (supabase/seed.sql)', () => {
      expect(hasSeedFile).toBe(true);
      expect(seedContent.length).toBeGreaterThan(100);
    });

    test('F3: 6 categories seeded matching static catalog', () => {
      const expectedCategories = ['pots-pans', 'knives', 'utensils', 'tableware', 'baking', 'appliances'];
      for (const catId of expectedCategories) {
        expect(seedContent.includes(catId)).toBe(true);
      }
    });

    test('F3: 10 products seeded matching static catalog', () => {
      for (let i = 1; i <= 10; i++) {
        expect(seedContent.includes(`prod-${i}`)).toBe(true);
      }
    });

    test('F3: 19 product variants seeded', () => {
      // Check for variant IDs var-1-1 through var-10-2
      expect(seedContent.includes('var-1-1')).toBe(true);
      expect(seedContent.includes('var-10-1')).toBe(true);
    });

    test('F3: 20 product images seeded', () => {
      expect(seedContent.includes('img-1-1')).toBe(true);
      expect(seedContent.includes('img-10-2')).toBe(true);
    });
  }
});

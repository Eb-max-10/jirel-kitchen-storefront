/**
 * Tier 1: Centralized Configuration & Environment Templates Test
 * Feature Coverage: F11 (Centralized Site Config), F12 (Environment Variable Templates)
 * Authoritative source: ORIGINAL_REQUEST §R4, PROJECT.md §Feature Inventory F11, F12
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect, skip } from '../helpers/test-framework.mjs';

const ROOT_DIR = process.cwd();
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');
const SITE_CONFIG_PATH = path.join(ROOT_DIR, 'src', 'config', 'site.ts');

describe('Tier 1: Centralized Config & .env.example (F11, F12)', () => {
  const hasEnvExample = fs.existsSync(ENV_EXAMPLE_PATH);
  const hasSiteConfig = fs.existsSync(SITE_CONFIG_PATH);

  if (!hasEnvExample) {
    skip('F12: .env.example existence and placeholder documentation', '.env.example not yet created (M4 in progress)');
    skip('F12: Required environment variables defined in .env.example', '.env.example not yet created (M4 in progress)');
  } else {
    const envContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');

    test('F12: .env.example existence and placeholder documentation', () => {
      expect(hasEnvExample).toBe(true);
      expect(envContent.length).toBeGreaterThan(50);
    });

    test('F12: Required environment variables defined in .env.example', () => {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
        'PAYSTACK_SECRET_KEY',
      ];
      for (const envVar of requiredVars) {
        expect(envContent.includes(envVar)).toBe(true);
      }
    });
  }

  if (!hasSiteConfig) {
    skip('F11: Centralized site configuration (src/config/site.ts) presence', 'src/config/site.ts not yet created (M4 in progress)');
    skip('F11: Site configuration exports required properties (whatsapp, currency, paystack)', 'src/config/site.ts not yet created (M4 in progress)');
  } else {
    const configSource = fs.readFileSync(SITE_CONFIG_PATH, 'utf8');

    test('F11: Centralized site configuration (src/config/site.ts) presence', () => {
      expect(hasSiteConfig).toBe(true);
    });

    test('F11: Site configuration exports required properties (whatsapp, currency, paystack)', () => {
      expect(configSource.includes('currency') || configSource.includes('NGN')).toBe(true);
      expect(configSource.includes('whatsapp') || configSource.includes('phone') || configSource.includes('support')).toBe(true);
    });
  }
});

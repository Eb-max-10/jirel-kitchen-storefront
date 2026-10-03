/**
 * Tier 1: Production Build & Typecheck Validation Test
 * Feature Coverage: F14 (Build Verification)
 * Authoritative source: ORIGINAL_REQUEST §Acceptance Criteria
 */

import { execSync } from 'node:child_process';
import { describe, test, expect } from '../helpers/test-framework.mjs';

describe('Tier 1: Production Build & TypeScript Typecheck (F14)', () => {
  test('TypeScript compiler (tsc --noEmit) passes with 0 errors', () => {
    try {
      const output = execSync('npx tsc --noEmit', {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8',
      });
      expect(output.trim().length === 0 || !output.includes('error TS')).toBe(true);
    } catch (err) {
      throw new Error(`TypeScript typecheck failed: ${err.stdout || err.stderr || err.message}`);
    }
  });

  test('package.json contains required build scripts', () => {
    const pkg = JSON.parse(execSync('node -e "console.log(JSON.stringify(require(\'./package.json\')))"', {
      cwd: process.cwd(),
      encoding: 'utf8',
    }));
    expect(pkg.scripts.build).toBe('next build');
    expect(pkg.scripts.dev).toBe('next dev');
  });
});

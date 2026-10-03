/**
 * Tier 2: Dynamic Slug Boundary and Security Tests
 * Authoritative source: ORIGINAL_REQUEST §R3, PROJECT.md §Feature F8
 */

import { describe, test, expect } from '../helpers/test-framework.mjs';
import { products } from '../../src/data/products.ts';

function findProductBySlug(slug) {
  if (typeof slug !== 'string' || !slug.trim()) return undefined;
  return products.find((p) => p.slug === slug);
}

describe('Tier 2: Slug Resolution & Non-Existent 404 Boundaries', () => {
  test('All 10 authentic catalog slugs resolve correctly', () => {
    for (const prod of products) {
      const match = findProductBySlug(prod.slug);
      expect(match).toBeDefined();
      expect(match.id).toBe(prod.id);
      expect(match.name).toBe(prod.name);
    }
  });

  test('Non-existent slug returns undefined (triggering 404/notFound)', () => {
    const invalidSlugs = [
      'non-existent-pan-999',
      'golden-teapot',
      'random-item-12345',
      'the-never-pan',
    ];
    for (const slug of invalidSlugs) {
      const match = findProductBySlug(slug);
      expect(match).toBeUndefined();
    }
  });

  test('Path traversal attempts safely fail to resolve', () => {
    const traversalSlugs = [
      '..',
      '../..',
      '../../app',
      '../src/data/products',
      '..\\..\\windows',
    ];
    for (const slug of traversalSlugs) {
      const match = findProductBySlug(slug);
      expect(match).toBeUndefined();
    }
  });

  test('Injection and XSS attempts safely fail to resolve', () => {
    const maliciousSlugs = [
      "<script>alert('xss')</script>",
      "' OR '1'='1",
      '"; DROP TABLE products; --',
      'the-always-pan" autofocus onfocus="alert(1)',
    ];
    for (const slug of maliciousSlugs) {
      const match = findProductBySlug(slug);
      expect(match).toBeUndefined();
    }
  });

  test('Case sensitivity: uppercase or mixed-case slugs fail to resolve', () => {
    expect(findProductBySlug('THE-ALWAYS-PAN')).toBeUndefined();
    expect(findProductBySlug('The-Always-Pan')).toBeUndefined();
    expect(findProductBySlug('Cast-Iron-Skillet')).toBeUndefined();
  });

  test('Empty, whitespace, or invalid types return undefined', () => {
    expect(findProductBySlug('')).toBeUndefined();
    expect(findProductBySlug('   ')).toBeUndefined();
    expect(findProductBySlug(null)).toBeUndefined();
    expect(findProductBySlug(undefined)).toBeUndefined();
    expect(findProductBySlug(12345)).toBeUndefined();
  });
});

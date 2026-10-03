/**
 * Jirel Kitchen E2E Test Framework
 * Lightweight, zero-dependency test harness for Node.js ESM.
 */

import assert from 'node:assert';

export class TestRegistry {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.totalSkipped = 0;
    this.startTime = Date.now();
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  async test(name, fn, options = {}) {
    const suite = this.currentSuite || {
      name: 'Default Suite',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
    };
    if (!this.currentSuite) {
      this.suites.push(suite);
      this.currentSuite = suite;
    }

    if (options.skip) {
      suite.skipped++;
      this.totalSkipped++;
      suite.tests.push({ name, status: 'skipped', reason: options.reason || 'Skipped' });
      return;
    }

    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      suite.passed++;
      this.totalPassed++;
      suite.tests.push({ name, status: 'passed', duration });
    } catch (err) {
      const duration = Date.now() - start;
      suite.failed++;
      this.totalFailed++;
      suite.tests.push({ name, status: 'failed', duration, error: err });
    }
  }

  skip(name, reason = 'Pending milestone') {
    return this.test(name, () => {}, { skip: true, reason });
  }

  printSummary() {
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log('\n============================================================');
    console.log('              JIREL KITCHEN E2E TEST SUMMARY                ');
    console.log('============================================================');

    for (const suite of this.suites) {
      const statusSymbol = suite.failed > 0 ? '❌' : suite.passed > 0 ? '✅' : '⚠️';
      console.log(`\n${statusSymbol} [SUITE] ${suite.name}`);
      for (const t of suite.tests) {
        if (t.status === 'passed') {
          console.log(`   ✔ ${t.name} (${t.duration}ms)`);
        } else if (t.status === 'skipped') {
          console.log(`   ○ ${t.name} [PENDING/SKIPPED: ${t.reason}]`);
        } else {
          console.log(`   ✖ ${t.name} (${t.duration}ms)`);
          console.log(`      Error: ${t.error?.message || t.error}`);
          if (t.error?.stack) {
            const firstStack = t.error.stack.split('\n').slice(1, 4).join('\n');
            console.log(`      ${firstStack}`);
          }
        }
      }
    }

    console.log('\n------------------------------------------------------------');
    console.log(`Total Suites:  ${this.suites.length}`);
    console.log(`Passed Tests:  ${this.totalPassed}`);
    console.log(`Failed Tests:  ${this.totalFailed}`);
    console.log(`Skipped Tests: ${this.totalSkipped}`);
    console.log(`Duration:      ${totalDuration}s`);
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

// Global registry instance
export const registry = new TestRegistry();

export function describe(name, fn) {
  registry.describe(name, fn);
}

export async function test(name, fn, options) {
  await registry.test(name, fn, options);
}

export const it = test;

export function skip(name, reason) {
  return registry.skip(name, reason);
}

export function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected, `Expected ${actual} to be ${expected}`);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected, `Expected deep equality`);
    },
    toBeTruthy() {
      assert.ok(actual, `Expected ${actual} to be truthy`);
    },
    toBeFalsy() {
      assert.ok(!actual, `Expected ${actual} to be falsy`);
    },
    toBeGreaterThan(num) {
      assert.ok(actual > num, `Expected ${actual} > ${num}`);
    },
    toBeGreaterThanOrEqual(num) {
      assert.ok(actual >= num, `Expected ${actual} >= ${num}`);
    },
    toBeLessThan(num) {
      assert.ok(actual < num, `Expected ${actual} < ${num}`);
    },
    toBeLessThanOrEqual(num) {
      assert.ok(actual <= num, `Expected ${actual} <= ${num}`);
    },
    toContain(item) {
      if (typeof actual === 'string' || Array.isArray(actual)) {
        assert.ok(actual.includes(item), `Expected container to include ${item}`);
      } else if (actual instanceof Set || actual instanceof Map) {
        assert.ok(actual.has(item), `Expected collection to contain ${item}`);
      } else {
        throw new Error(`Unsupported container type for toContain: ${typeof actual}`);
      }
    },
    toMatch(regex) {
      assert.ok(regex.test(String(actual)), `Expected "${actual}" to match regex ${regex}`);
    },
    toBeNull() {
      assert.strictEqual(actual, null, `Expected ${actual} to be null`);
    },
    toBeUndefined() {
      assert.strictEqual(actual, undefined, `Expected ${actual} to be undefined`);
    },
    toBeDefined() {
      assert.notStrictEqual(actual, undefined, `Expected value to be defined`);
    },
    toThrow(expected) {
      assert.throws(actual, expected);
    },
  };
}

// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { auditPnpmLicenses, evaluateLicenseExpression } from './license-policy';

describe('tools/check-licenses policy evaluator', () => {
  it('approves standard permissive licenses and dual-licensed permissive expressions', () => {
    expect(evaluateLicenseExpression('MIT')).toBe('allowed');
    expect(evaluateLicenseExpression('Apache-2.0')).toBe('allowed');
    expect(evaluateLicenseExpression('(MIT OR CC0-1.0)')).toBe('allowed');
    expect(evaluateLicenseExpression('(MIT OR GPL-3.0-only)')).toBe('allowed');
    expect(evaluateLicenseExpression('(MPL-2.0 OR Custom-1.0)')).toBe(
      'mpl-review',
    );
    expect(evaluateLicenseExpression('(GPL-2.0-only OR AGPL-3.0-only)')).toBe(
      'forbidden',
    );
    expect(evaluateLicenseExpression('(Foo-1.0 OR Bar-1.0)')).toBe('unknown');
    expect(evaluateLicenseExpression('BSD-2-Clause AND ISC')).toBe('allowed');
    expect(evaluateLicenseExpression('MIT AND MPL-2.0')).toBe('mpl-review');
    expect(evaluateLicenseExpression('MIT AND CustomExpr-2.0')).toBe('unknown');
    expect(evaluateLicenseExpression('(MIT OR ISC) AND Apache-2.0')).toBe(
      'unknown',
    );
    expect(evaluateLicenseExpression('(MIT OR ISC) AND GPL-3.0')).toBe(
      'forbidden',
    );
  });

  it('flags GPL, AGPL, LGPL, SSPL, and empty licenses as forbidden', () => {
    expect(evaluateLicenseExpression('GPL-3.0-only')).toBe('forbidden');
    expect(evaluateLicenseExpression('AGPL-3.0-or-later')).toBe('forbidden');
    expect(evaluateLicenseExpression('LGPL-2.1-only')).toBe('forbidden');
    expect(evaluateLicenseExpression('SSPL-1.0')).toBe('forbidden');
    expect(evaluateLicenseExpression('MIT AND GPL-2.0-only')).toBe('forbidden');
    expect(evaluateLicenseExpression('UNKNOWN')).toBe('forbidden');
    expect(evaluateLicenseExpression('()')).toBe('unknown');
    expect(evaluateLicenseExpression('')).toBe('forbidden');
  });

  it('requires explicit review for MPL-2.0 and refuses unknown custom licenses', () => {
    const sampleFixture = {
      MIT: [{ name: 'zod', version: '4.6.7' }],
      'MPL-2.0': [
        { name: 'some-mpl-pkg', versions: ['1.0.0'], license: 'MPL-2.0' },
      ],
      'Custom-Weird-1.0': [
        {
          name: 'mystery-pkg',
          versions: ['0.1.0'],
          license: 'Custom-Weird-1.0',
        },
      ],
      'GPL-3.0': [{ name: 'copyleft-pkg', license: 'GPL-3.0' }],
    };

    const failReport = auditPnpmLicenses(sampleFixture, {
      schemaVersion: 1,
      reviewedPackages: [],
    });
    expect(failReport.ok).toBe(false);
    expect(failReport.issues.map((i) => i.category)).toEqual([
      'manual-review-required',
      'unknown',
      'forbidden',
    ]);

    const reviewedMplOnly = auditPnpmLicenses(
      {
        MIT: [{ name: 'zod', versions: ['4.6.7'], license: 'MIT' }],
        'MPL-2.0': [
          { name: 'some-mpl-pkg', versions: ['1.0.0'], license: 'MPL-2.0' },
        ],
      },
      {
        schemaVersion: 1,
        reviewedPackages: [
          {
            name: 'some-mpl-pkg',
            license: 'MPL-2.0',
            reason: 'Unmodified build-time CSS parser',
          },
        ],
      },
    );
    expect(reviewedMplOnly.ok).toBe(true);
    expect(reviewedMplOnly.reviewedExceptionCount).toBe(1);
  });
});

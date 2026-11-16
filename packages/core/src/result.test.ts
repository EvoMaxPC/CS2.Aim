// SPDX-License-Identifier: Apache-2.0

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, mapError, mapResult, ok, unwrapOr } from './result';

describe('Result<T, E>', () => {
  it('constructs Ok and narrows accurately', () => {
    const res = ok(42);
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
    expect(unwrapOr(res, 0)).toBe(42);
  });

  it('constructs Err and returns fallback in unwrapOr', () => {
    const res = err('invalid-input');
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
    expect(unwrapOr(res, 99)).toBe(99);
  });

  it('maps Ok values and leaves Err untouched', () => {
    expect(mapResult(ok(10), (n) => n * 2)).toEqual(ok(20));
    expect(mapResult(err<string>('boom'), (n: number) => n * 2)).toEqual(
      err('boom'),
    );
  });

  it('maps Err errors and leaves Ok untouched', () => {
    expect(mapError(err('low'), (s) => s.toUpperCase())).toEqual(err('LOW'));
    expect(mapError(ok(7), (s: string) => s.toUpperCase())).toEqual(ok(7));
  });

  it('satisfies functor identity and composition laws (property-based)', () => {
    fc.assert(
      fc.property(fc.integer(), (value) => {
        const initial = ok(value);
        const f = (x: number): number => x + 3;
        const g = (x: number): number => x * 5;

        expect(mapResult(initial, (x) => x)).toEqual(initial);
        expect(mapResult(mapResult(initial, f), g)).toEqual(
          mapResult(initial, (x) => g(f(x))),
        );
      }),
    );

    fc.assert(
      fc.property(fc.string(), (message) => {
        const failure = err(message);
        expect(mapError(failure, (e) => e)).toEqual(failure);
        expect(unwrapOr(failure, 123)).toBe(123);
      }),
    );
  });
});

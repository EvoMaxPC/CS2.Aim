// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { validatePrTitle } from './pr-title';

describe('tools/check-pr-title Conventional Commits validator', () => {
  it('accepts valid scoped and unscoped titles aligned with CONVENTIONS.md', () => {
    expect(
      validatePrTitle('feat(infra): layer 1 skeleton and tooling').ok,
    ).toBe(true);
    expect(
      validatePrTitle(
        'docs: layer 0 foundations (EVO-AIM-CS2, open source, multi-platform)',
      ).ok,
    ).toBe(true);
    expect(
      validatePrTitle('fix(platform)!: enforce strict path canonicalization')
        .ok,
    ).toBe(true);
  });

  it('rejects malformed titles, invalid types/scopes, trailing periods, and overly long headers', () => {
    expect(validatePrTitle('').ok).toBe(false);
    expect(validatePrTitle('Update README').ok).toBe(false);
    expect(validatePrTitle('wip(core): test').ok).toBe(false);
    expect(validatePrTitle('feat(unknownscope): add feature').ok).toBe(false);
    expect(validatePrTitle('feat(core): trailing period.').ok).toBe(false);
    expect(validatePrTitle(`feat(core): ${'a'.repeat(120)}`).ok).toBe(false);
  });
});

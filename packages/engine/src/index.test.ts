// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getEngineSkeletonStatus } from './index';

describe('@evo-aim/engine skeleton', () => {
  it('exposes uninitialized Layer 1 status targeting Layer 4', () => {
    const status = getEngineSkeletonStatus();
    expect(status.ok).toBe(true);
    if (status.ok) {
      expect(status.value).toEqual({
        product: 'EVO-AIM-CS2',
        initialized: false,
        targetLayer: 4,
      });
    }
  });
});

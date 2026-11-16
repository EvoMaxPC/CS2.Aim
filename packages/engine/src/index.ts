// SPDX-License-Identifier: Apache-2.0

import { PRODUCT_NAME, type Result, ok } from '@evo-aim/core';
import type { VerifiedCatalogEntry } from '@evo-aim/data';

/**
 * Layer 1 skeleton descriptor for `@evo-aim/engine`.
 *
 * Full 3D WebGL2 rendering, Pointer Lock capture, and the 240 Hz fixed-timestep
 * simulation loop are scheduled for Layer 4 (`docs/ROADMAP.md`) after completing
 * `SPIKE-1`, `SPIKE-2`, `SPIKE-3`, `SPIKE-5`, and `SPIKE-6`.
 */
export interface EngineSkeletonStatus {
  readonly product: typeof PRODUCT_NAME;
  readonly initialized: false;
  readonly targetLayer: 4;
}

export type EngineScenarioPlaceholder = VerifiedCatalogEntry<{
  readonly placeholder: true;
}>;

export function getEngineSkeletonStatus(): Result<EngineSkeletonStatus, never> {
  return ok({
    product: PRODUCT_NAME,
    initialized: false,
    targetLayer: 4,
  });
}

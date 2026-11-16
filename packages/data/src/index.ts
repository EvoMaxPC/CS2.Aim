// SPDX-License-Identifier: Apache-2.0

import {
  type DataProvenance,
  type Result,
  validateProvenance,
  mapResult,
} from '@evo-aim/core';

export interface VerifiedCatalogEntry<T> {
  readonly id: string;
  readonly data: T;
  readonly provenance: DataProvenance;
}

export function createCatalogEntry<T>(
  id: string,
  data: T,
  provenance: unknown,
): Result<VerifiedCatalogEntry<T>, string> {
  const trimmedId = id.trim();
  if (trimmedId.length === 0) {
    return { ok: false, error: 'id: catalog entry id must not be empty' };
  }
  return mapResult(validateProvenance(provenance), (validProvenance) => ({
    id: trimmedId,
    data,
    provenance: validProvenance,
  }));
}

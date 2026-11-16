// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createCatalogEntry } from './index';

describe('@evo-aim/data skeleton wiring', () => {
  it('creates a provenance-validated catalog entry using @evo-aim/core', () => {
    const entry = createCatalogEntry(
      'electron-45-support',
      { minWindowsMajor: 10 },
      {
        source: 'https://github.com/electron/electron/blob/v45.3.2/README.md',
        sourceTier: 'official',
        retrievedAt: '2026-11-13T00:00:00Z',
        verified: true,
        notes: 'Official Electron 45 README platform support section.',
      },
    );

    expect(entry.ok).toBe(true);
    if (entry.ok) {
      expect(entry.value.id).toBe('electron-45-support');
      expect(entry.value.data.minWindowsMajor).toBe(10);
    }
  });

  it('rejects empty catalog ids and invalid provenance', () => {
    const emptyId = createCatalogEntry('', { flag: true }, {});
    expect(emptyId.ok).toBe(false);

    const badProv = createCatalogEntry(
      'valid-id',
      { flag: true },
      { source: '' },
    );
    expect(badProv.ok).toBe(false);
  });
});

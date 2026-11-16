// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  APP_ID,
  AppInfoResponseSchema,
  IPC_CHANNELS,
  IPC_CONTRACTS,
  NativeModulesDiagResponseSchema,
  PRODUCT_NAME,
  USER_DATA_SUBDIR,
  isAllowedIpcChannel,
  validateProvenance,
} from './index';

describe('DataProvenance validation', () => {
  it('accepts a complete, verified provenance object', () => {
    const result = validateProvenance({
      source: 'https://github.com/electron/electron/blob/v45.3.2/README.md',
      sourceTier: 'official',
      retrievedAt: '2026-11-13T00:00:00Z',
      verified: true,
      verifiedBy: 'EvoMaxPC',
      notes: 'Verified Electron 45.3.2 supported operating systems.',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sourceTier).toBe('official');
      expect(result.value.verified).toBe(true);
    }
  });

  it('rejects missing fields, non-UTC timestamps, and unknown properties', () => {
    const badTimestamp = validateProvenance({
      source: 'https://doi.org/10.1037/h0055392',
      sourceTier: 'peer-reviewed',
      retrievedAt: '2026-11-13',
      verified: false,
      notes: 'Missing time and Z suffix',
    });
    expect(badTimestamp.ok).toBe(false);

    const extraKey = validateProvenance({
      source: 'https://doi.org/10.1037/h0055392',
      sourceTier: 'peer-reviewed',
      retrievedAt: '2026-11-13T12:00:00Z',
      verified: false,
      notes: 'Extra property should fail strict mode',
      unexpectedField: true,
    });
    expect(extraKey.ok).toBe(false);
    if (!extraKey.ok) {
      expect(extraKey.error).toContain('<root>');
    }
  });
});

describe('IPC contracts and channel allowlist', () => {
  it('recognizes only allowlisted channels', () => {
    expect(isAllowedIpcChannel(IPC_CHANNELS.appGetInfo)).toBe(true);
    expect(isAllowedIpcChannel(IPC_CHANNELS.diagNativeModules)).toBe(true);
    expect(isAllowedIpcChannel('shell:exec')).toBe(false);
    expect(isAllowedIpcChannel('__proto__')).toBe(false);
  });

  it('validates AppInfoResponse payloads strictly', () => {
    const valid = AppInfoResponseSchema.safeParse({
      name: PRODUCT_NAME,
      appId: APP_ID,
      version: '0.0.1',
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.1.0',
      userDataSubdir: USER_DATA_SUBDIR,
      versions: {
        electron: '45.3.2',
        chrome: '156.0.8078.100',
        node: '24.22.2',
      },
    });
    expect(valid.success).toBe(true);

    const wrongAppId = AppInfoResponseSchema.safeParse({
      name: PRODUCT_NAME,
      appId: 'wrong.id',
      version: '0.0.1',
      platform: 'win32',
      arch: 'x64',
      osRelease: '10.0.22631',
      userDataSubdir: USER_DATA_SUBDIR,
      versions: { electron: '45.3.2', chrome: '156.0.0', node: '24.22.2' },
    });
    expect(wrongAppId.success).toBe(false);
  });

  it('enforces conditional fields in NativeModulesDiagResponseSchema', () => {
    expect(
      IPC_CONTRACTS[IPC_CHANNELS.diagNativeModules].request.safeParse(undefined)
        .success,
    ).toBe(true);
    expect(
      IPC_CONTRACTS[IPC_CHANNELS.diagNativeModules].request.safeParse({
        injected: 1,
      }).success,
    ).toBe(false);

    expect(
      NativeModulesDiagResponseSchema.safeParse({
        ok: true,
        moduleName: 'better-sqlite3',
        sqliteVersion: '3.50.0',
      }).success,
    ).toBe(true);

    expect(
      NativeModulesDiagResponseSchema.safeParse({
        ok: true,
        moduleName: 'better-sqlite3',
      }).success,
    ).toBe(false);

    expect(
      NativeModulesDiagResponseSchema.safeParse({
        ok: false,
        moduleName: 'better-sqlite3',
        error: 'ABI load error',
      }).success,
    ).toBe(true);

    expect(
      NativeModulesDiagResponseSchema.safeParse({
        ok: false,
        moduleName: 'better-sqlite3',
      }).success,
    ).toBe(false);
  });
});

// SPDX-License-Identifier: Apache-2.0

import type { Logger } from '@evo-aim/core';
import { describe, expect, it } from 'vitest';
import { createPlatformAdapter } from '../platform';
import { APP_PROTOCOL_ORIGIN } from '../security/protocol-path';
import { createIpcDispatcher, runNativeSqliteDiagnostic } from './handlers';

const noopLogger: Logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  child: () => noopLogger,
};

const trustedEvent = {
  senderFrame: {
    url: `${APP_PROTOCOL_ORIGIN}/index.html`,
    parent: null,
  },
};

describe('IPC security dispatcher and SPIKE-4 SQLite probe', () => {
  const dispatcher = createIpcDispatcher({
    appVersion: '0.0.1',
    runtimeVersions: {
      electron: '45.3.2',
      chrome: '156.0.8078.100',
      node: '24.22.2',
    },
    platformAdapter: createPlatformAdapter({
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.1.158',
      env: { DISPLAY: ':99' },
    }),
    logger: noopLogger,
    isDev: false,
  });

  it('returns validated AppInfoResponse for app:getInfo from trusted main frame', () => {
    const info = dispatcher.dispatch('app:getInfo', trustedEvent, undefined);
    expect('appId' in info && info.appId).toBe('io.github.evomaxpc.evoaim');
    expect('name' in info && info.name).toBe('EVO-AIM-CS2');
  });

  it('executes real in-memory better-sqlite3 probe via diag:nativeModules (SPIKE-4)', () => {
    const diag = dispatcher.dispatch(
      'diag:nativeModules',
      trustedEvent,
      undefined,
    );
    expect('moduleName' in diag && diag.moduleName).toBe('better-sqlite3');
    expect('ok' in diag && diag.ok).toBe(true);
    if ('ok' in diag && diag.ok) {
      expect(diag.sqliteVersion).toMatch(/^\d+\.\d+\.\d+/);
    }
  });

  it('handles native module load failures gracefully without crashing', () => {
    const brokenDiag = runNativeSqliteDiagnostic(() => {
      throw new Error('Simulated ABI mismatch');
    });
    expect(brokenDiag).toEqual({
      ok: false,
      moduleName: 'better-sqlite3',
      error: 'Simulated ABI mismatch',
    });
  });

  it('rejects unknown channels, unexpected payloads, subframes, and untrusted origins', () => {
    expect(() =>
      dispatcher.dispatch('fs:readArbitraryFile', trustedEvent, undefined),
    ).toThrow(/not allowlisted/);

    expect(() =>
      dispatcher.dispatch('app:getInfo', trustedEvent, { unexpected: true }),
    ).toThrow(/Invalid request payload/);

    expect(() =>
      dispatcher.dispatch(
        'app:getInfo',
        { senderFrame: { url: 'https://attacker.example', parent: null } },
        undefined,
      ),
    ).toThrow(/untrusted sender origin/);

    expect(() =>
      dispatcher.dispatch(
        'app:getInfo',
        {
          senderFrame: {
            url: `${APP_PROTOCOL_ORIGIN}/index.html`,
            parent: { url: `${APP_PROTOCOL_ORIGIN}/index.html` },
          },
        },
        undefined,
      ),
    ).toThrow(/subframes are not permitted/);

    expect(() =>
      dispatcher.dispatch('app:getInfo', { senderFrame: null }, undefined),
    ).toThrow(/missing senderFrame/);
  });
});

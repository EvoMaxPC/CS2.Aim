// SPDX-License-Identifier: Apache-2.0

import { createRequire } from 'node:module';
import {
  APP_ID,
  type AppInfoResponse,
  IPC_CHANNELS,
  IPC_CONTRACTS,
  type Logger,
  type NativeModulesDiagResponse,
  PRODUCT_NAME,
  isAllowedIpcChannel,
} from '@evo-aim/core';
import type { PlatformAdapter } from '../platform';
import { isTrustedRendererOrigin } from '../security/window-security';

export interface SenderFrameLike {
  readonly url: string;
  readonly parent: unknown;
}

export interface IpcInvocationEventLike {
  readonly senderFrame: SenderFrameLike | null;
}

export interface SqliteProbeLike {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): unknown;
    get(...params: unknown[]): unknown;
  };
  close(): void;
}

export type SqliteFactory = () => SqliteProbeLike;

export function createLazyBetterSqliteFactory(): SqliteFactory {
  const nodeRequire = createRequire(__filename);
  return () => {
    const BetterSqlite3 = nodeRequire('better-sqlite3') as new (
      filename: string,
    ) => SqliteProbeLike;
    return new BetterSqlite3(':memory:');
  };
}

export function runNativeSqliteDiagnostic(
  sqliteFactory: SqliteFactory = createLazyBetterSqliteFactory(),
): NativeModulesDiagResponse {
  let db: SqliteProbeLike | undefined;
  try {
    db = sqliteFactory();
    db.exec(
      'CREATE TABLE spike4_probe (id INTEGER PRIMARY KEY, label TEXT NOT NULL);',
    );
    db.prepare('INSERT INTO spike4_probe (id, label) VALUES (?, ?);').run(
      1,
      'evo-aim-spike4-ok',
    );
    const row = db
      .prepare(
        'SELECT label, sqlite_version() AS sqliteVersion FROM spike4_probe WHERE id = ?;',
      )
      .get(1) as
      | { readonly label?: unknown; readonly sqliteVersion?: unknown }
      | undefined;

    if (
      row === undefined ||
      row.label !== 'evo-aim-spike4-ok' ||
      typeof row.sqliteVersion !== 'string' ||
      row.sqliteVersion.length === 0
    ) {
      return {
        ok: false,
        moduleName: 'better-sqlite3',
        error: 'Unexpected row returned by in-memory SQLite probe',
      };
    }

    return {
      ok: true,
      moduleName: 'better-sqlite3',
      sqliteVersion: row.sqliteVersion,
    };
  } catch (caught: unknown) {
    const message =
      caught instanceof Error ? caught.message : 'Unknown native module error';
    return {
      ok: false,
      moduleName: 'better-sqlite3',
      error: message,
    };
  } finally {
    try {
      db?.close();
    } catch {
      // Ignore close error on failed handle
    }
  }
}

export interface IpcDispatcherDependencies {
  readonly appVersion: string;
  readonly runtimeVersions: {
    readonly electron: string;
    readonly chrome: string;
    readonly node: string;
  };
  readonly platformAdapter: PlatformAdapter;
  readonly logger: Logger;
  readonly isDev: boolean;
  readonly devServerOrigin?: string;
  readonly sqliteFactory?: SqliteFactory;
}

export function assertTrustedSender(
  event: IpcInvocationEventLike,
  options: { readonly isDev: boolean; readonly devServerOrigin?: string },
): void {
  const frame = event.senderFrame;
  if (frame === null) {
    throw new Error('IPC rejected: missing senderFrame');
  }
  if (frame.parent !== null && frame.parent !== undefined) {
    throw new Error('IPC rejected: subframes are not permitted to invoke IPC');
  }
  if (!isTrustedRendererOrigin(frame.url, options)) {
    throw new Error(`IPC rejected: untrusted sender origin "${frame.url}"`);
  }
}

export function createIpcDispatcher(deps: IpcDispatcherDependencies) {
  const originOptions =
    deps.devServerOrigin !== undefined
      ? { isDev: deps.isDev, devServerOrigin: deps.devServerOrigin }
      : { isDev: deps.isDev };

  return {
    dispatch(
      channel: string,
      event: IpcInvocationEventLike,
      rawPayload: unknown,
    ): AppInfoResponse | NativeModulesDiagResponse {
      if (!isAllowedIpcChannel(channel)) {
        deps.logger.warn('ipc.blocked_channel', { channel });
        throw new Error(`IPC channel "${channel}" is not allowlisted`);
      }

      assertTrustedSender(event, originOptions);

      if (channel === IPC_CHANNELS.appGetInfo) {
        const reqCheck =
          IPC_CONTRACTS[IPC_CHANNELS.appGetInfo].request.safeParse(rawPayload);
        if (!reqCheck.success) {
          throw new Error('Invalid request payload for app:getInfo');
        }

        const platformInfo = deps.platformAdapter.getPlatformInfo();
        const candidate: AppInfoResponse = {
          name: PRODUCT_NAME,
          appId: APP_ID,
          version: deps.appVersion,
          platform: platformInfo.id,
          arch: platformInfo.arch,
          osRelease: platformInfo.osRelease,
          userDataSubdir: deps.platformAdapter.getUserDataSubdirName(),
          versions: {
            electron: deps.runtimeVersions.electron,
            chrome: deps.runtimeVersions.chrome,
            node: deps.runtimeVersions.node,
          },
        };

        return IPC_CONTRACTS[IPC_CHANNELS.appGetInfo].response.parse(candidate);
      }

      const reqCheck =
        IPC_CONTRACTS[IPC_CHANNELS.diagNativeModules].request.safeParse(
          rawPayload,
        );
      if (!reqCheck.success) {
        throw new Error('Invalid request payload for diag:nativeModules');
      }

      const diag = runNativeSqliteDiagnostic(deps.sqliteFactory);
      deps.logger.info('ipc.diag_native_modules', {
        ok: diag.ok,
        sqliteVersion: diag.sqliteVersion,
      });
      return IPC_CONTRACTS[IPC_CHANNELS.diagNativeModules].response.parse(diag);
    },
  };
}

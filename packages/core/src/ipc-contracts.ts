// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

export const PRODUCT_NAME = 'EVO-AIM-CS2' as const;
export const APP_ID = 'io.github.evomaxpc.evoaim' as const;
export const USER_DATA_SUBDIR = 'EVO-AIM-CS2' as const;

export const IPC_CHANNELS = {
  appGetInfo: 'app:getInfo',
  diagNativeModules: 'diag:nativeModules',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

export const ALLOWED_IPC_CHANNELS: ReadonlySet<string> = new Set<string>(
  Object.values(IPC_CHANNELS),
);

export function isAllowedIpcChannel(channel: string): channel is IpcChannel {
  return ALLOWED_IPC_CHANNELS.has(channel);
}

export const EmptyIpcRequestSchema = z.undefined();

export const SupportedPlatformIdSchema = z.enum(['win32', 'linux', 'darwin']);
export type SupportedPlatformId = z.infer<typeof SupportedPlatformIdSchema>;

export const AppInfoResponseSchema = z
  .object({
    name: z.literal(PRODUCT_NAME),
    appId: z.literal(APP_ID),
    version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/),
    platform: SupportedPlatformIdSchema,
    arch: z.string().min(1),
    osRelease: z.string().min(1),
    userDataSubdir: z.literal(USER_DATA_SUBDIR),
    versions: z
      .object({
        electron: z.string().min(1),
        chrome: z.string().min(1),
        node: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export type AppInfoResponse = z.infer<typeof AppInfoResponseSchema>;

export const NativeModulesDiagResponseSchema = z
  .object({
    ok: z.boolean(),
    moduleName: z.literal('better-sqlite3'),
    sqliteVersion: z.string().min(1).optional(),
    error: z.string().min(1).optional(),
  })
  .strict()
  .refine(
    (val) =>
      val.ok ? val.sqliteVersion !== undefined : val.error !== undefined,
    {
      message:
        'NativeModulesDiagResponse requires sqliteVersion when ok=true and error when ok=false',
    },
  );

export type NativeModulesDiagResponse = z.infer<
  typeof NativeModulesDiagResponseSchema
>;

export const IPC_CONTRACTS = {
  [IPC_CHANNELS.appGetInfo]: {
    request: EmptyIpcRequestSchema,
    response: AppInfoResponseSchema,
  },
  [IPC_CHANNELS.diagNativeModules]: {
    request: EmptyIpcRequestSchema,
    response: NativeModulesDiagResponseSchema,
  },
} as const;

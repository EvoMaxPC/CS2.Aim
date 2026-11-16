// SPDX-License-Identifier: Apache-2.0

export {
  type Err,
  type Ok,
  type Result,
  err,
  isErr,
  isOk,
  mapError,
  mapResult,
  ok,
  unwrapOr,
} from './result';

export {
  type DataProvenance,
  DataProvenanceSchema,
  type SourceTier,
  SourceTierSchema,
  validateProvenance,
} from './provenance';

export {
  LOG_LEVELS,
  type LogLevel,
  type LogRecord,
  type Logger,
} from './logger';

export {
  ALLOWED_IPC_CHANNELS,
  APP_ID,
  type AppInfoResponse,
  AppInfoResponseSchema,
  EmptyIpcRequestSchema,
  IPC_CHANNELS,
  IPC_CONTRACTS,
  type IpcChannel,
  type NativeModulesDiagResponse,
  NativeModulesDiagResponseSchema,
  PRODUCT_NAME,
  type SupportedPlatformId,
  SupportedPlatformIdSchema,
  USER_DATA_SUBDIR,
  isAllowedIpcChannel,
} from './ipc-contracts';

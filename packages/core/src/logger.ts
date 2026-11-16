// SPDX-License-Identifier: Apache-2.0

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LogRecord {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly scope: string;
  readonly event: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface Logger {
  debug(event: string, context?: Readonly<Record<string, unknown>>): void;
  info(event: string, context?: Readonly<Record<string, unknown>>): void;
  warn(event: string, context?: Readonly<Record<string, unknown>>): void;
  error(event: string, context?: Readonly<Record<string, unknown>>): void;
  child(subScope: string): Logger;
}

// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { LogLevel, LogRecord, Logger } from '@evo-aim/core';

const LEVEL_PRIORITY: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const WINDOWS_USERS_REGEX = /[A-Za-z]:\\Users\\[^\\/\s"']+/g;
const POSIX_HOME_REGEX = /\/(?:home|Users)\/[^/\s"']+/g;
const SECRET_TOKEN_REGEX =
  /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|Bearer\s+[A-Za-z0-9._~+/=-]{12,})/gi;
const SENSITIVE_KEY_REGEX =
  /(?:token|secret|password|passwd|apikey|api_key|authorization)/i;

export function sanitizeStringValue(
  raw: string,
  explicitHomeDir?: string,
): string {
  let sanitized = raw;
  if (explicitHomeDir !== undefined && explicitHomeDir.length > 1) {
    sanitized = sanitized.split(explicitHomeDir).join('<USER_HOME>');
  }
  sanitized = sanitized.replace(WINDOWS_USERS_REGEX, '<USER_HOME>');
  sanitized = sanitized.replace(POSIX_HOME_REGEX, '<USER_HOME>');
  sanitized = sanitized.replace(SECRET_TOKEN_REGEX, '<REDACTED_TOKEN>');
  return sanitized;
}

export function sanitizeLogValue(
  value: unknown,
  explicitHomeDir?: string,
  seen: WeakSet<object> = new WeakSet(),
): unknown {
  if (typeof value === 'string') {
    return sanitizeStringValue(value, explicitHomeDir);
  }
  if (
    value === null ||
    value === undefined ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeStringValue(value.message, explicitHomeDir),
      stack:
        value.stack !== undefined
          ? sanitizeStringValue(value.stack, explicitHomeDir)
          : undefined,
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, explicitHomeDir, seen));
  }
  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
    const out: Record<string, unknown> = {};
    for (const [key, entryVal] of Object.entries(value)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        out[key] = '<REDACTED_SECRET>';
      } else {
        out[key] = sanitizeLogValue(entryVal, explicitHomeDir, seen);
      }
    }
    return out;
  }
  if (typeof value === 'bigint' || typeof value === 'symbol') {
    return value.toString();
  }
  return '[Unserializable]';
}

export interface FileLoggerOptions {
  readonly logFilePath: string;
  readonly minLevel?: LogLevel;
  readonly maxBytes?: number;
  readonly homeDir?: string;
  readonly nowIso?: () => string;
}

export function createStructuredLogger(
  scope: string,
  options: FileLoggerOptions,
): Logger {
  const minLevel = options.minLevel ?? 'info';
  const maxBytes = options.maxBytes ?? 1_048_576; // 1 MiB simple size rotation
  const homeDir = options.homeDir ?? os.homedir();
  const nowIso = options.nowIso ?? (() => new Date().toISOString());

  const writeRecord = (
    currentScope: string,
    level: LogLevel,
    event: string,
    context?: Readonly<Record<string, unknown>>,
  ): void => {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[minLevel]) {
      return;
    }

    const sanitizedContext =
      context !== undefined
        ? (sanitizeLogValue(context, homeDir) as Readonly<
            Record<string, unknown>
          >)
        : undefined;

    const record: LogRecord =
      sanitizedContext !== undefined
        ? {
            timestamp: nowIso(),
            level,
            scope: currentScope,
            event: sanitizeStringValue(event, homeDir),
            context: sanitizedContext,
          }
        : {
            timestamp: nowIso(),
            level,
            scope: currentScope,
            event: sanitizeStringValue(event, homeDir),
          };

    const line = `${JSON.stringify(record)}\n`;

    try {
      const dir = path.dirname(options.logFilePath);
      fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(options.logFilePath)) {
        const stat = fs.statSync(options.logFilePath);
        if (stat.size + Buffer.byteLength(line, 'utf8') > maxBytes) {
          const rotatedPath = `${options.logFilePath}.1`;
          fs.rmSync(rotatedPath, { force: true });
          fs.renameSync(options.logFilePath, rotatedPath);
        }
      }
      fs.appendFileSync(options.logFilePath, line, 'utf8');
    } catch {
      // Fallback to stderr if disk becomes read-only so logging never crashes the app
      process.stderr.write(line);
    }
  };

  const makeScopedLogger = (currentScope: string): Logger => ({
    debug: (event, context) => {
      writeRecord(currentScope, 'debug', event, context);
    },
    info: (event, context) => {
      writeRecord(currentScope, 'info', event, context);
    },
    warn: (event, context) => {
      writeRecord(currentScope, 'warn', event, context);
    },
    error: (event, context) => {
      writeRecord(currentScope, 'error', event, context);
    },
    child: (subScope) => makeScopedLogger(`${currentScope}:${subScope}`),
  });

  return makeScopedLogger(scope);
}

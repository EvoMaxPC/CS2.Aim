// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import { type Result, err, ok } from '@evo-aim/core';

export const APP_PROTOCOL_SCHEME = 'app' as const;
export const APP_PROTOCOL_HOST = 'evoaim' as const;
export const APP_PROTOCOL_ORIGIN =
  `${APP_PROTOCOL_SCHEME}://${APP_PROTOCOL_HOST}` as const;

export interface ProtocolPathError {
  readonly code:
    'INVALID_URL' | 'WRONG_ORIGIN' | 'FORBIDDEN_CHARACTER' | 'PATH_TRAVERSAL';
  readonly message: string;
}

const MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function getMimeTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}

/**
 * Safely resolves an `app://evoaim/...` URL to a file strictly inside `rendererRootDir`.
 * Blocks `..`, encoded `%2e%2e`, encoded backslashes `%5c`, null bytes, and wrong hosts.
 */
export function resolveSafeProtocolPath(
  rendererRootDir: string,
  rawRequestUrl: string,
): Result<string, ProtocolPathError> {
  if (
    rawRequestUrl.includes('\0') ||
    /%00/i.test(rawRequestUrl) ||
    /%5c/i.test(rawRequestUrl) ||
    rawRequestUrl.includes('\\')
  ) {
    return err({
      code: 'FORBIDDEN_CHARACTER',
      message: 'Blocked null byte or backslash in protocol URL',
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawRequestUrl);
  } catch {
    return err({
      code: 'INVALID_URL',
      message: 'Malformed protocol URL',
    });
  }

  if (
    parsed.protocol !== `${APP_PROTOCOL_SCHEME}:` ||
    parsed.hostname.toLowerCase() !== APP_PROTOCOL_HOST ||
    parsed.port !== ''
  ) {
    return err({
      code: 'WRONG_ORIGIN',
      message: `Expected origin ${APP_PROTOCOL_ORIGIN}`,
    });
  }

  // Reject raw dot-dot or encoded dot/slash segments BEFORE URL normalization can collapse `..`
  const afterSchemeIdx = rawRequestUrl.indexOf('://');
  const rawAfterAuthority =
    afterSchemeIdx >= 0
      ? rawRequestUrl.slice(afterSchemeIdx + 3)
      : rawRequestUrl;
  const firstSlashIdx = rawAfterAuthority.indexOf('/');
  const rawPathAndRest =
    firstSlashIdx >= 0 ? rawAfterAuthority.slice(firstSlashIdx) : '/';
  const rawPathOnly = rawPathAndRest.split(/[?#]/)[0] ?? '/';

  if (
    /%2e/i.test(rawRequestUrl) ||
    /%2f/i.test(rawRequestUrl) ||
    rawPathOnly.split('/').some((seg) => seg === '..' || seg === '.')
  ) {
    return err({
      code: 'PATH_TRAVERSAL',
      message:
        'Dot traversal or encoded dot/slash segments are forbidden in app:// URLs',
    });
  }

  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(parsed.pathname);
  } catch {
    return err({
      code: 'INVALID_URL',
      message: 'Malformed percent-encoding in pathname',
    });
  }

  if (
    decodedPathname.includes('\0') ||
    decodedPathname.includes('\\') ||
    decodedPathname.split('/').some((segment) => segment === '..')
  ) {
    return err({
      code: 'PATH_TRAVERSAL',
      message: 'Directory traversal segment detected',
    });
  }

  const relativePath =
    decodedPathname === '/' || decodedPathname === ''
      ? 'index.html'
      : decodedPathname.replace(/^\/+/, '');

  const resolvedRoot = path.resolve(rendererRootDir);
  const candidatePath = path.resolve(resolvedRoot, relativePath);
  const relFromRoot = path.relative(resolvedRoot, candidatePath);

  if (
    relFromRoot.startsWith('..') ||
    path.isAbsolute(relFromRoot) ||
    relFromRoot.length === 0
  ) {
    return err({
      code: 'PATH_TRAVERSAL',
      message: 'Resolved path escapes renderer root directory',
    });
  }

  return ok(candidatePath);
}

// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

export interface NoOwnerViolation {
  readonly filePath: string;
  readonly lineNumber: number;
  readonly ruleId:
    | 'forbidden-legacy-identifier'
    | 'windows-personal-path'
    | 'posix-personal-path'
    | 'private-lan-ip'
    | 'secret-token';
  readonly excerpt: string;
}

export interface NoOwnerScanResult {
  readonly ok: boolean;
  readonly scannedFilesCount: number;
  readonly violations: readonly NoOwnerViolation[];
}

const IGNORED_DIRS: ReadonlySet<string> = new Set([
  '.git',
  'node_modules',
  'dist',
  'out',
  'release',
  'coverage',
  'playwright-report',
  'test-results',
]);

const TEXT_EXTENSIONS: ReadonlySet<string> = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.txt',
]);

const SELF_EXEMPT_RELATIVE_PATHS: ReadonlySet<string> = new Set([
  'tools/check-no-owner-values/scanner.ts',
  'tools/check-no-owner-values/scanner.test.ts',
  'apps/desktop/src/main/logging/structured-logger.test.ts',
  'apps/desktop/src/main/platform/platform.test.ts',
]);

// Build legacy patterns dynamically so this source file never contains raw forbidden substrings
const FORBIDDEN_LEGACY_NAMES: readonly string[] = [
  ['CS2', '.', 'Aim'].join(''),
  ['app', '.', 'evoaim', '.', 'cs2'].join(''),
  ['CS2', 'Aim', 'Pro'].join(''),
];

const WINDOWS_USER_PATH_REGEX =
  /\b[A-Za-z]:\\Users\\(?!(?:<|\.\.\.|TuNombre|username\b|user\b|Public\b|Default\b))[A-Za-z0-9._-]+/i;

const POSIX_USER_PATH_REGEX =
  /(?:^|[\s"'`(=])\/(?:home|Users)\/(?!(?:<|\.\.\.|username\b|user\b|runner\b|ubuntu\b))[A-Za-z0-9._-]+\//;

const PRIVATE_LAN_IP_REGEX =
  /\b(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/;

const SECRET_TOKEN_REGEX =
  /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{24,}|AKIA[0-9A-Z]{16})\b/;

export function scanLineForOwnerValues(line: string): ReadonlyArray<{
  readonly ruleId: NoOwnerViolation['ruleId'];
  readonly excerpt: string;
}> {
  const hits: Array<{
    readonly ruleId: NoOwnerViolation['ruleId'];
    readonly excerpt: string;
  }> = [];

  for (const forbidden of FORBIDDEN_LEGACY_NAMES) {
    if (line.includes(forbidden)) {
      hits.push({
        ruleId: 'forbidden-legacy-identifier',
        excerpt: forbidden,
      });
    }
  }

  const winMatch = WINDOWS_USER_PATH_REGEX.exec(line);
  if (winMatch !== null) {
    hits.push({
      ruleId: 'windows-personal-path',
      excerpt: winMatch[0],
    });
  }

  const posixMatch = POSIX_USER_PATH_REGEX.exec(line);
  if (posixMatch !== null) {
    hits.push({
      ruleId: 'posix-personal-path',
      excerpt: posixMatch[0].trim(),
    });
  }

  const ipMatch = PRIVATE_LAN_IP_REGEX.exec(line);
  if (ipMatch !== null) {
    hits.push({
      ruleId: 'private-lan-ip',
      excerpt: ipMatch[0],
    });
  }

  const tokenMatch = SECRET_TOKEN_REGEX.exec(line);
  if (tokenMatch !== null) {
    hits.push({
      ruleId: 'secret-token',
      excerpt: `${tokenMatch[0].slice(0, 8)}...`,
    });
  }

  return hits;
}

export function scanWorkspaceForOwnerValues(
  rootDir: string,
  options?: { readonly allowSelfExemptions?: boolean },
): NoOwnerScanResult {
  const allowExemptions = options?.allowSelfExemptions ?? true;
  let scannedFilesCount = 0;
  const violations: NoOwnerViolation[] = [];

  const walk = (currentDir: string): void => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      const absPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(absPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }

      const relPosix = path
        .relative(rootDir, absPath)
        .split(path.sep)
        .join('/');
      if (relPosix === 'pnpm-lock.yaml') {
        continue;
      }
      if (allowExemptions && SELF_EXEMPT_RELATIVE_PATHS.has(relPosix)) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      const isKnownDotfile =
        entry.name === '.editorconfig' ||
        entry.name === '.gitattributes' ||
        entry.name === '.gitignore' ||
        entry.name === '.npmrc' ||
        entry.name === '.nvmrc';

      if (!TEXT_EXTENSIONS.has(ext) && !isKnownDotfile) {
        continue;
      }

      scannedFilesCount += 1;
      const content = fs.readFileSync(absPath, 'utf8');
      const lines = content.split(/\r?\n/);

      for (let idx = 0; idx < lines.length; idx += 1) {
        const line = lines[idx] ?? '';
        const lineHits = scanLineForOwnerValues(line);
        for (const hit of lineHits) {
          violations.push({
            filePath: relPosix,
            lineNumber: idx + 1,
            ruleId: hit.ruleId,
            excerpt: hit.excerpt,
          });
        }
      }
    }
  };

  walk(rootDir);

  return {
    ok: violations.length === 0,
    scannedFilesCount,
    violations,
  };
}

// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createStructuredLogger,
  sanitizeLogValue,
  sanitizeStringValue,
} from './structured-logger';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('Structured logger and PII / secret sanitization', () => {
  it('redacts Windows and Linux user home paths and secret tokens', () => {
    const winInput =
      'Failed reading C:\\Users\\JuanPerez\\AppData\\Roaming\\EVO-AIM-CS2\\config.json';
    expect(sanitizeStringValue(winInput)).toBe(
      'Failed reading <USER_HOME>\\AppData\\Roaming\\EVO-AIM-CS2\\config.json',
    );

    const linuxInput =
      'Loaded db at /home/marcelo/.config/EVO-AIM-CS2/evoaim.sqlite with ghp_1234567890abcdefghijklmnopqr';
    expect(sanitizeStringValue(linuxInput)).toBe(
      'Loaded db at <USER_HOME>/.config/EVO-AIM-CS2/evoaim.sqlite with <REDACTED_TOKEN>',
    );
  });

  it('redacts sensitive object keys and Error stacks without failing on circular objects', () => {
    const circular: Record<string, unknown> = {
      path: '/Users/alice/Library/Application Support/EVO-AIM-CS2',
      apiToken: 'super-secret-value',
    };
    circular['self'] = circular;

    const errObj = new Error('Crash inside C:\\Users\\Admin\\Desktop\\app');
    const cleaned = sanitizeLogValue({
      nested: circular,
      errObj,
      count: 3,
      flag: true,
    }) as Record<string, unknown>;

    const nested = cleaned['nested'] as Record<string, unknown>;
    expect(nested['path']).toBe(
      '<USER_HOME>/Library/Application Support/EVO-AIM-CS2',
    );
    expect(nested['apiToken']).toBe('<REDACTED_SECRET>');
    expect(nested['self']).toBe('[Circular]');
  });

  it('writes JSONL records and rotates log file when exceeding maxBytes', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evoaim-log-test-'));
    tempDirs.push(tmpDir);
    const logFile = path.join(tmpDir, 'evoaim.jsonl');

    const logger = createStructuredLogger('main', {
      logFilePath: logFile,
      minLevel: 'info',
      maxBytes: 260,
      homeDir: '/custom/secret-user',
      nowIso: () => '2026-11-13T12:00:00.000Z',
    });

    logger.debug('ignored.debug');
    logger.info('boot.started', { dir: '/custom/secret-user/data' });
    logger.child('ipc').warn('ipc.notice', { attempt: 2 });
    logger.error('boot.heavy_event', {
      detail: 'padding-text-to-trigger-size-rotation-cleanly',
    });

    expect(fs.existsSync(logFile)).toBe(true);
    expect(fs.existsSync(`${logFile}.1`)).toBe(true);

    const currentContent = fs.readFileSync(logFile, 'utf8').trim();
    const rotatedContent = fs.readFileSync(`${logFile}.1`, 'utf8').trim();
    expect(currentContent).not.toContain('secret-user');
    expect(rotatedContent).toContain('<USER_HOME>/data');
  });
});

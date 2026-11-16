// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  APP_PROTOCOL_ORIGIN,
  getMimeTypeForPath,
  resolveSafeProtocolPath,
} from './protocol-path';
import {
  buildContentSecurityPolicy,
  createHardenedWebPreferences,
  isAllowedExternalUrl,
  isAllowedInternalNavigation,
  isTrustedRendererOrigin,
} from './window-security';

describe('Custom app:// protocol safe path resolution', () => {
  const rootDir = path.resolve('/opt/evo-aim-cs2/resources/app/out/renderer');

  it('resolves root and nested static assets inside rendererRootDir', () => {
    const indexRes = resolveSafeProtocolPath(
      rootDir,
      `${APP_PROTOCOL_ORIGIN}/`,
    );
    expect(indexRes).toEqual({
      ok: true,
      value: path.join(rootDir, 'index.html'),
    });

    const jsRes = resolveSafeProtocolPath(
      rootDir,
      `${APP_PROTOCOL_ORIGIN}/assets/index-abc123.js`,
    );
    expect(jsRes).toEqual({
      ok: true,
      value: path.join(rootDir, 'assets', 'index-abc123.js'),
    });
    expect(getMimeTypeForPath('index.html')).toContain('text/html');
    expect(getMimeTypeForPath('bundle.js')).toContain('text/javascript');
    expect(getMimeTypeForPath('unknown.bin')).toBe('application/octet-stream');
  });

  it('blocks .. traversal, encoded %2e%2e, backslashes, null bytes, and wrong origins', () => {
    const attacks = [
      `${APP_PROTOCOL_ORIGIN}/../../etc/passwd`,
      `${APP_PROTOCOL_ORIGIN}/assets/%2e%2e/%2e%2e/main/index.cjs`,
      `${APP_PROTOCOL_ORIGIN}/%2E%2E/secret.txt`,
      `${APP_PROTOCOL_ORIGIN}/assets%2f..%2fsecret.txt`,
      `${APP_PROTOCOL_ORIGIN}/assets\\..\\secret.txt`,
      `${APP_PROTOCOL_ORIGIN}/assets/%5c../secret.txt`,
      `${APP_PROTOCOL_ORIGIN}/index.html%00.png`,
      'file:///etc/passwd',
      'https://evil.example/index.html',
      'app://other-host/index.html',
      'not a valid url',
    ];

    for (const url of attacks) {
      const result = resolveSafeProtocolPath(rootDir, url);
      expect(result.ok, `Expected URL to be blocked: ${url}`).toBe(false);
    }
  });
});

describe('Electron BrowserWindow hardening & CSP', () => {
  it('enforces mandatory BrowserWindow security flags (QB-12)', () => {
    const prefs = createHardenedWebPreferences('/app/out/preload/index.cjs');
    expect(prefs.contextIsolation).toBe(true);
    expect(prefs.nodeIntegration).toBe(false);
    expect(prefs.nodeIntegrationInWorker).toBe(false);
    expect(prefs.nodeIntegrationInSubFrames).toBe(false);
    expect(prefs.sandbox).toBe(true);
    expect(prefs.webSecurity).toBe(true);
    expect(prefs.allowRunningInsecureContent).toBe(false);
    expect(prefs.webviewTag).toBe(false);
    expect('enableRemoteModule' in prefs).toBe(false);
  });

  it('produces a strict production CSP with zero unsafe-eval and zero unsafe-inline', () => {
    const prodCsp = buildContentSecurityPolicy({ isDev: false });
    expect(prodCsp).not.toContain('unsafe-eval');
    expect(prodCsp).not.toContain('unsafe-inline');
    expect(prodCsp).toContain("default-src 'none'");
    expect(prodCsp).toContain("script-src 'self'");
    expect(prodCsp).toContain("object-src 'none'");

    const devCsp = buildContentSecurityPolicy({
      isDev: true,
      devServerOrigin: 'http://localhost:5173',
    });
    expect(devCsp).not.toContain('unsafe-eval');
    expect(devCsp).toContain('ws://localhost:5173');
  });

  it('blocks untrusted navigation and non-allowlisted external URLs', () => {
    expect(
      isAllowedInternalNavigation('app://evoaim/index.html#/train', {
        isDev: false,
      }),
    ).toBe(true);
    expect(
      isAllowedInternalNavigation('https://malicious.example/', {
        isDev: false,
      }),
    ).toBe(false);
    expect(
      isTrustedRendererOrigin('http://localhost:5173/index.html', {
        isDev: true,
        devServerOrigin: 'http://localhost:5173',
      }),
    ).toBe(true);
    expect(
      isTrustedRendererOrigin('http://localhost:5173/index.html', {
        isDev: false,
      }),
    ).toBe(false);

    expect(
      isAllowedExternalUrl('https://github.com/EvoMaxPC/evo-aim-cs2/issues'),
    ).toBe(true);
    expect(isAllowedExternalUrl('https://github.com/other/repo')).toBe(false);
    expect(isAllowedExternalUrl('http://github.com/EvoMaxPC/evo-aim-cs2')).toBe(
      false,
    );
    expect(isAllowedExternalUrl('javascript:alert(1)')).toBe(false);
  });

  it('verifies zero inline style attributes across renderer and @evo-aim/ui so style-src self works without unsafe-inline (ADR-0017)', () => {
    const repoRoot = path.resolve(__dirname, '../../../../..');
    const targetDirs = [
      path.join(repoRoot, 'apps', 'desktop', 'src', 'renderer'),
      path.join(repoRoot, 'packages', 'ui', 'src'),
    ];
    const inlineStyleViolations: string[] = [];
    const inlineStyleRegex = /\bstyle\s*=|<\s*style\b/i;

    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (
          entry.isFile() &&
          /\.(?:tsx?|html)$/i.test(entry.name) &&
          !entry.name.endsWith('.test.ts') &&
          !entry.name.endsWith('.test.tsx')
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (inlineStyleRegex.test(content)) {
            inlineStyleViolations.push(path.relative(repoRoot, fullPath));
          }
        }
      }
    };

    for (const dir of targetDirs) {
      walk(dir);
    }

    expect(inlineStyleViolations).toEqual([]);
  });
});

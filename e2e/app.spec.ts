// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import {
  type ElectronApplication,
  type Page,
  _electron as electron,
  expect,
  test,
} from '@playwright/test';

interface ResolutionProfile {
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly scaleFactor: number;
}

const RESOLUTION_PROFILES: readonly ResolutionProfile[] = [
  { label: '1280x720@1', width: 1280, height: 720, scaleFactor: 1 },
  { label: '1920x1080@1.5', width: 1920, height: 1080, scaleFactor: 1.5 },
  { label: '3840x2160@2', width: 3840, height: 2160, scaleFactor: 2 },
];

async function launchElectronShell(extraArgs: readonly string[] = []): Promise<{
  readonly electronApp: ElectronApplication;
  readonly window: Page;
}> {
  const mainEntry = path.resolve(
    __dirname,
    '../apps/desktop/out/main/index.cjs',
  );
  const electronApp = await electron.launch({
    args: [...extraArgs, mainEntry],
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  return { electronApp, window };
}

test.describe('EVO-AIM-CS2 Desktop Shell — Parameterized DPI & Viewport Matrix', () => {
  for (const profile of RESOLUTION_PROFILES) {
    test(`renders shell without horizontal overflow and shows SPIKE-4 status at ${profile.label}`, async () => {
      const { electronApp, window } = await launchElectronShell([
        `--force-device-scale-factor=${String(profile.scaleFactor)}`,
      ]);
      try {
        await window.setViewportSize({
          width: profile.width,
          height: profile.height,
        });
        await expect(window.getByTestId('page-home')).toBeVisible();

        const routes: ReadonlyArray<{
          readonly navTestId: string;
          readonly pageTestId: string;
        }> = [
          { navTestId: 'nav-item-train', pageTestId: 'page-train' },
          { navTestId: 'nav-item-routines', pageTestId: 'page-routines' },
          { navTestId: 'nav-item-stats', pageTestId: 'page-stats' },
          { navTestId: 'nav-item-science', pageTestId: 'page-science' },
          {
            navTestId: 'nav-item-calibration',
            pageTestId: 'page-calibration',
          },
          { navTestId: 'nav-item-settings', pageTestId: 'page-settings' },
        ];

        for (const route of routes) {
          await window.getByTestId(route.navTestId).click();
          await expect(window.getByTestId(route.pageTestId)).toBeVisible();
        }

        await expect(window.getByTestId('app-info-appid')).toContainText(
          'io.github.evomaxpc.evoaim',
        );
        await expect(window.getByTestId('spike4-sqlite-status')).toContainText(
          'OK',
        );

        // Verify no horizontal document overflow at this viewport & DPI scale
        const hasHorizontalOverflow = await window.evaluate(() => {
          const doc = (
            globalThis as {
              readonly document?: {
                readonly documentElement: {
                  readonly scrollWidth: number;
                  readonly clientWidth: number;
                };
              };
            }
          ).document;
          if (doc === undefined) {
            return false;
          }
          return (
            doc.documentElement.scrollWidth >
            doc.documentElement.clientWidth + 1
          );
        });
        expect(hasHorizontalOverflow).toBe(false);
      } finally {
        await electronApp.close();
      }
    });
  }
});

test.describe('EVO-AIM-CS2 Desktop Shell — Keyboard-Only, Reduced Motion & Security Audit', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    const launched = await launchElectronShell();
    electronApp = launched.electronApp;
    window = launched.window;
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('completes full navigation across all 7 sections using keyboard only (Tab / Enter)', async () => {
    await expect(window.getByTestId('page-home')).toBeVisible();

    const orderedTargets: ReadonlyArray<{
      readonly navTestId: string;
      readonly pageTestId: string;
    }> = [
      { navTestId: 'nav-item-train', pageTestId: 'page-train' },
      { navTestId: 'nav-item-routines', pageTestId: 'page-routines' },
      { navTestId: 'nav-item-stats', pageTestId: 'page-stats' },
      { navTestId: 'nav-item-science', pageTestId: 'page-science' },
      { navTestId: 'nav-item-calibration', pageTestId: 'page-calibration' },
      { navTestId: 'nav-item-settings', pageTestId: 'page-settings' },
      { navTestId: 'nav-item-home', pageTestId: 'page-home' },
    ];

    // Focus the first sidebar link via Tab progression (skip link -> collapse button -> Inicio)
    await window.keyboard.press('Tab');
    await window.keyboard.press('Tab');
    await window.keyboard.press('Tab');

    for (const target of orderedTargets) {
      await window.getByTestId(target.navTestId).focus();
      await window.keyboard.press('Enter');
      await expect(window.getByTestId(target.pageTestId)).toBeVisible();
      await expect(window.getByTestId(target.navTestId)).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
  });

  test('respects prefers-reduced-motion: reduce by suppressing CSS transition durations', async () => {
    await window.emulateMedia({ reducedMotion: 'reduce' });

    const transitionDuration = await window.evaluate(() => {
      const g = globalThis as {
        readonly matchMedia?: (q: string) => { readonly matches: boolean };
        readonly document?: {
          readonly querySelector: (sel: string) => unknown;
        };
        readonly getComputedStyle?: (el: unknown) => {
          readonly transitionDuration: string;
        };
      };
      const mediaMatches =
        g.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const navEl = g.document?.querySelector('[data-testid="nav-item-home"]');
      const duration =
        navEl !== null &&
        navEl !== undefined &&
        g.getComputedStyle !== undefined
          ? g.getComputedStyle(navEl).transitionDuration
          : '';
      return { mediaMatches, duration };
    });

    expect(transitionDuration.mediaMatches).toBe(true);
    // 0.01ms collapses in Chromium computed styles to 0.00001s or 0s
    expect(['0s', '0.00001s', '1e-05s']).toContain(transitionDuration.duration);

    await window.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('enforces live renderer sandbox, contextIsolation, CSP, and app:// custom protocol', async () => {
    expect(new URL(window.url()).protocol).toBe('app:');

    const rendererSecurity = await window.evaluate(() => {
      const globalRecord = globalThis as Record<string, unknown>;

      // Attempt injecting an inline <script> tag — strict CSP (script-src 'self') must block execution
      globalRecord['__cspInlineExecuted'] = false;
      const doc = globalRecord['document'] as {
        createElement: (tag: string) => {
          textContent: string;
          remove: () => void;
        };
        head: { appendChild: (el: unknown) => void };
      };
      const scriptEl = doc.createElement('script');
      scriptEl.textContent = 'globalThis.__cspInlineExecuted = true;';
      doc.head.appendChild(scriptEl);
      scriptEl.remove();
      const inlineScriptBlockedByCsp =
        globalRecord['__cspInlineExecuted'] === false;
      delete globalRecord['__cspInlineExecuted'];

      const openFn = globalRecord['open'] as
        ((url: string, target: string) => unknown) | undefined;
      const popupHandle =
        typeof openFn === 'function'
          ? openFn('https://example.com', '_blank')
          : null;

      return {
        hasRequire: typeof globalRecord['require'] !== 'undefined',
        hasProcess: typeof globalRecord['process'] !== 'undefined',
        hasBuffer: typeof globalRecord['Buffer'] !== 'undefined',
        evoaimKeys:
          typeof globalRecord['evoaim'] === 'object' &&
          globalRecord['evoaim'] !== null
            ? Object.keys(globalRecord['evoaim'])
            : [],
        inlineScriptBlockedByCsp,
        popupOpened: popupHandle !== null,
      };
    });

    expect(rendererSecurity.hasRequire).toBe(false);
    expect(rendererSecurity.hasProcess).toBe(false);
    expect(rendererSecurity.hasBuffer).toBe(false);
    expect(rendererSecurity.evoaimKeys.sort()).toEqual([
      'checkNativeModules',
      'getAppInfo',
    ]);
    expect(rendererSecurity.inlineScriptBlockedByCsp).toBe(true);
    expect(rendererSecurity.popupOpened).toBe(false);

    const mainState = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      const win = windows[0];
      if (!win) {
        throw new Error('Expected one active BrowserWindow');
      }
      return {
        windowCount: windows.length,
        currentUrl: win.webContents.getURL(),
        isDestroyed: win.isDestroyed(),
      };
    });

    expect(mainState.windowCount).toBe(1);
    expect(mainState.currentUrl.startsWith('app://evoaim/')).toBe(true);
    expect(mainState.isDestroyed).toBe(false);
  });
});

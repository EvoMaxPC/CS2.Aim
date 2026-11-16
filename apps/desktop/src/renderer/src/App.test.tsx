// SPDX-License-Identifier: Apache-2.0

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { STRINGS_ES } from './strings.es';

beforeEach(() => {
  window.location.hash = '#/';
  window.evoaim = {
    getAppInfo: vi.fn().mockResolvedValue({
      name: 'EVO-AIM-CS2',
      appId: 'io.github.evomaxpc.evoaim',
      version: '0.0.1',
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.1.158',
      userDataSubdir: 'EVO-AIM-CS2',
      versions: {
        electron: '45.3.2',
        chrome: '156.0.8078.100',
        node: '24.22.2',
      },
    }),
    checkNativeModules: vi.fn().mockResolvedValue({
      ok: true,
      moduleName: 'better-sqlite3',
      sqliteVersion: '3.50.0',
    }),
  };
});

afterEach(() => {
  cleanup();
  delete window.evoaim;
});

describe('Desktop Renderer Shell — 7 pages, landmarks, ErrorBoundary, and Settings SPIKE-4 view', () => {
  it('renders navigation & main landmarks, navigates through all 7 pages, and refreshes SPIKE-4 diagnostics', async () => {
    render(<App />);

    expect(
      screen.getByRole('navigation', {
        name: STRINGS_ES.sidebarLandmarkLabel,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole('main', { name: STRINGS_ES.mainLandmarkLabel }),
    ).toBeDefined();

    for (const page of STRINGS_ES.pages) {
      const link = screen.getByRole('link', { name: page.navLabel });
      fireEvent.click(link);

      const heading = await screen.findByRole('heading', {
        level: 1,
        name: page.title,
      });
      expect(heading).toBeDefined();
      expect(link.getAttribute('aria-current')).toBe('page');
    }

    await waitFor(() => {
      expect(screen.getByTestId('app-info-appid').textContent).toBe(
        'io.github.evomaxpc.evoaim',
      );
      expect(screen.getByTestId('spike4-sqlite-status').textContent).toContain(
        'OK',
      );
    });

    // Click refresh button on SettingsPage
    fireEvent.click(
      screen.getByRole('button', {
        name: STRINGS_ES.settings.refreshDiagButton,
      }),
    );
    await waitFor(() => {
      expect(window.evoaim?.getAppInfo).toHaveBeenCalledTimes(2);
    });
  });

  it('handles missing preload bridge, failed SQLite diagnostic, and IPC errors gracefully on SettingsPage', async () => {
    // 1. Missing window.evoaim bridge
    delete window.evoaim;
    window.location.hash = '#/settings';
    const first = render(<App />);
    expect(
      screen.getAllByText(STRINGS_ES.settings.bridgeUnavailableText).length,
    ).toBeGreaterThanOrEqual(1);
    first.unmount();

    // 2. Failed native module probe (ok: false with error)
    window.evoaim = {
      getAppInfo: vi.fn().mockResolvedValue({
        name: 'EVO-AIM-CS2',
        appId: 'io.github.evomaxpc.evoaim',
        version: '0.0.1',
        platform: 'win32',
        arch: 'x64',
        osRelease: '10.0.22631',
        userDataSubdir: 'EVO-AIM-CS2',
        versions: {
          electron: '45.3.2',
          chrome: '156.0.8078.100',
          node: '24.22.2',
        },
      }),
      checkNativeModules: vi.fn().mockResolvedValue({
        ok: false,
        moduleName: 'better-sqlite3',
        error: 'ABI load error',
      }),
    };
    const second = render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('spike4-sqlite-status').textContent).toContain(
        'FALLO',
      );
      expect(screen.getByText('ABI load error')).toBeDefined();
    });
    second.unmount();

    // 3. Rejected IPC promise
    window.evoaim = {
      getAppInfo: vi.fn().mockRejectedValue(new Error('IPC timeout')),
      checkNativeModules: vi.fn().mockRejectedValue(new Error('IPC timeout')),
    };
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/IPC timeout/)).toBeDefined();
    });
  });

  it('toggles sidebar collapsed state and shows runtime error banner on window error', () => {
    render(<App />);

    const collapseBtn = screen.getByRole('button', {
      name: STRINGS_ES.toggleSidebarCollapse,
    });
    fireEvent.click(collapseBtn);

    expect(
      screen.getByRole('button', { name: STRINGS_ES.toggleSidebarExpand }),
    ).toBeDefined();
    expect(screen.getByRole('link', { name: 'Entrenar' })).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event('error'));
    });
    expect(screen.getByRole('alert').textContent).toContain(
      STRINGS_ES.globalRuntimeErrorBanner,
    );
    expect(screen.getByRole('alert').textContent).toContain('[!]');
  });

  it('catches rendering crashes in ErrorBoundary and resets cleanly', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let shouldCrash = true;
    function VolatileChild() {
      if (shouldCrash) {
        throw new Error('Synthetic render explosion');
      }
      return <div data-testid="recovered-view">Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <VolatileChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText(STRINGS_ES.errorBoundaryTitle)).toBeDefined();
    expect(screen.getByText('Synthetic render explosion')).toBeDefined();

    shouldCrash = false;
    fireEvent.click(
      screen.getByRole('button', {
        name: STRINGS_ES.errorBoundaryReloadButton,
      }),
    );
    expect(screen.getByTestId('recovered-view')).toBeDefined();
    spy.mockRestore();
  });
});

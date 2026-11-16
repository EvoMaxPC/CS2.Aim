// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createPlatformAdapter } from './index';

describe('PlatformAdapter factory and OS implementations', () => {
  it('instantiates Win32PlatformAdapter via injected probe', () => {
    const adapter = createPlatformAdapter({
      platform: 'win32',
      arch: 'x64',
      osRelease: '10.0.22631',
      env: {},
    });

    expect(adapter.id).toBe('win32');
    expect(adapter.getUserDataSubdirName()).toBe('EVO-AIM-CS2');
    expect(adapter.getPlatformInfo()).toEqual({
      id: 'win32',
      arch: 'x64',
      osRelease: '10.0.22631',
      displayServerHint: 'native',
    });

    expect(adapter.locateSteamPath().ok).toBe(false);
    expect(adapter.locateCs2CfgPath().ok).toBe(false);
    expect(adapter.getSystemDpiDiagnostics().ok).toBe(false);
    expect(adapter.showSystemNotification('t', 'b').ok).toBe(false);
  });

  it('instantiates LinuxPlatformAdapter and detects X11, Wayland, and unknown display servers', () => {
    const wayland = createPlatformAdapter({
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.8.0',
      env: { XDG_SESSION_TYPE: 'wayland' },
    });
    expect(wayland.getPlatformInfo().displayServerHint).toBe('wayland');
    expect(wayland.getUserDataSubdirName()).toBe('EVO-AIM-CS2');

    const x11 = createPlatformAdapter({
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.8.0',
      env: { DISPLAY: ':0' },
    });
    expect(x11.getPlatformInfo().displayServerHint).toBe('x11');

    const headless = createPlatformAdapter({
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.8.0',
      env: {},
    });
    expect(headless.getPlatformInfo().displayServerHint).toBe('unknown');
    expect(headless.locateSteamPath().ok).toBe(false);
    expect(headless.locateCs2CfgPath().ok).toBe(false);
    expect(headless.getSystemDpiDiagnostics().ok).toBe(false);
    expect(headless.showSystemNotification('t', 'b').ok).toBe(false);
  });

  it('instantiates DarwinPlatformAdapter for macOS best-effort support', () => {
    const darwin = createPlatformAdapter({
      platform: 'darwin',
      arch: 'arm64',
      osRelease: '24.1.0',
      env: {},
    });

    expect(darwin.id).toBe('darwin');
    expect(darwin.getPlatformInfo().displayServerHint).toBe('native');
    expect(darwin.getUserDataSubdirName()).toBe('EVO-AIM-CS2');
    expect(darwin.locateSteamPath().ok).toBe(false);
    expect(darwin.locateCs2CfgPath().ok).toBe(false);
    expect(darwin.getSystemDpiDiagnostics().ok).toBe(false);
    expect(darwin.showSystemNotification('t', 'b').ok).toBe(false);
  });

  it('throws a clear error on unsupported platforms', () => {
    expect(() =>
      createPlatformAdapter({
        platform: 'freebsd',
        arch: 'x64',
        osRelease: '14.0',
        env: {},
      }),
    ).toThrow(/Unsupported host operating system/);
  });
});

// SPDX-License-Identifier: Apache-2.0

import { USER_DATA_SUBDIR } from '@evo-aim/core';
import {
  type PlatformAdapter,
  type PlatformInfo,
  type PlatformRuntimeProbe,
  notImplementedInLayer,
} from '../types';

function detectLinuxDisplayServer(
  env: Readonly<Record<string, string | undefined>>,
): 'x11' | 'wayland' | 'unknown' {
  const sessionType = env['XDG_SESSION_TYPE']?.toLowerCase();
  if (sessionType === 'wayland' || Boolean(env['WAYLAND_DISPLAY'])) {
    return 'wayland';
  }
  if (sessionType === 'x11' || Boolean(env['DISPLAY'])) {
    return 'x11';
  }
  return 'unknown';
}

export class LinuxPlatformAdapter implements PlatformAdapter {
  public readonly id = 'linux' as const;
  private readonly probe: PlatformRuntimeProbe;

  public constructor(probe: PlatformRuntimeProbe) {
    this.probe = probe;
  }

  public getPlatformInfo(): PlatformInfo {
    return {
      id: this.id,
      arch: this.probe.arch,
      osRelease: this.probe.osRelease,
      displayServerHint: detectLinuxDisplayServer(this.probe.env),
    };
  }

  public getUserDataSubdirName(): typeof USER_DATA_SUBDIR {
    return USER_DATA_SUBDIR;
  }

  // Capa 16
  public locateSteamPath() {
    return notImplementedInLayer('LinuxPlatformAdapter.locateSteamPath', 16);
  }

  // Capa 16
  public locateCs2CfgPath() {
    return notImplementedInLayer('LinuxPlatformAdapter.locateCs2CfgPath', 16);
  }

  // Capa 4 / Capa 9
  public getSystemDpiDiagnostics() {
    return notImplementedInLayer(
      'LinuxPlatformAdapter.getSystemDpiDiagnostics',
      4,
    );
  }

  // Capa 13
  public showSystemNotification(_title: string, _body: string) {
    return notImplementedInLayer(
      'LinuxPlatformAdapter.showSystemNotification',
      13,
    );
  }
}

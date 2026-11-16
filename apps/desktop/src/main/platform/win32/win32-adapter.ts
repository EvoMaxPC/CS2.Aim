// SPDX-License-Identifier: Apache-2.0

import { USER_DATA_SUBDIR } from '@evo-aim/core';
import {
  type PlatformAdapter,
  type PlatformInfo,
  type PlatformRuntimeProbe,
  notImplementedInLayer,
} from '../types';

export class Win32PlatformAdapter implements PlatformAdapter {
  public readonly id = 'win32' as const;
  private readonly probe: PlatformRuntimeProbe;

  public constructor(probe: PlatformRuntimeProbe) {
    this.probe = probe;
  }

  public getPlatformInfo(): PlatformInfo {
    return {
      id: this.id,
      arch: this.probe.arch,
      osRelease: this.probe.osRelease,
      displayServerHint: 'native',
    };
  }

  public getUserDataSubdirName(): typeof USER_DATA_SUBDIR {
    return USER_DATA_SUBDIR;
  }

  // Capa 16
  public locateSteamPath() {
    return notImplementedInLayer('Win32PlatformAdapter.locateSteamPath', 16);
  }

  // Capa 16
  public locateCs2CfgPath() {
    return notImplementedInLayer('Win32PlatformAdapter.locateCs2CfgPath', 16);
  }

  // Capa 4 / Capa 9
  public getSystemDpiDiagnostics() {
    return notImplementedInLayer(
      'Win32PlatformAdapter.getSystemDpiDiagnostics',
      4,
    );
  }

  // Capa 13
  public showSystemNotification(_title: string, _body: string) {
    return notImplementedInLayer(
      'Win32PlatformAdapter.showSystemNotification',
      13,
    );
  }
}

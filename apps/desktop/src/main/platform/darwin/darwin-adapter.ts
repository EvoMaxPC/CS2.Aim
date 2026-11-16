// SPDX-License-Identifier: Apache-2.0

import { USER_DATA_SUBDIR } from '@evo-aim/core';
import {
  type PlatformAdapter,
  type PlatformInfo,
  type PlatformRuntimeProbe,
  notImplementedInLayer,
} from '../types';

export class DarwinPlatformAdapter implements PlatformAdapter {
  public readonly id = 'darwin' as const;
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

  // Capa 16 (graceful degradation on macOS)
  public locateSteamPath() {
    return notImplementedInLayer('DarwinPlatformAdapter.locateSteamPath', 16);
  }

  // Capa 16 (graceful degradation on macOS)
  public locateCs2CfgPath() {
    return notImplementedInLayer('DarwinPlatformAdapter.locateCs2CfgPath', 16);
  }

  // Capa 4 / Capa 9
  public getSystemDpiDiagnostics() {
    return notImplementedInLayer(
      'DarwinPlatformAdapter.getSystemDpiDiagnostics',
      4,
    );
  }

  // Capa 13
  public showSystemNotification(_title: string, _body: string) {
    return notImplementedInLayer(
      'DarwinPlatformAdapter.showSystemNotification',
      13,
    );
  }
}

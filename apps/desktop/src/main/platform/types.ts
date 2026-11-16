// SPDX-License-Identifier: Apache-2.0

import type { Result, SupportedPlatformId } from '@evo-aim/core';

export interface PlatformInfo {
  readonly id: SupportedPlatformId;
  readonly arch: string;
  readonly osRelease: string;
  readonly displayServerHint: 'x11' | 'wayland' | 'native' | 'unknown';
}

export interface NotImplementedCapabilityError {
  readonly code: 'NOT_IMPLEMENTED';
  readonly targetLayer: number;
  readonly message: string;
}

export interface PlatformRuntimeProbe {
  readonly platform: NodeJS.Platform;
  readonly arch: string;
  readonly osRelease: string;
  readonly env: Readonly<Record<string, string | undefined>>;
}

export interface PlatformAdapter {
  readonly id: SupportedPlatformId;
  getPlatformInfo(): PlatformInfo;
  getUserDataSubdirName(): 'EVO-AIM-CS2';

  //Capa 16: Steam & CS2 local paths discovery and GSI config management
  locateSteamPath(): Result<string, NotImplementedCapabilityError>;
  locateCs2CfgPath(): Result<string, NotImplementedCapabilityError>;

  //Capa 4 / Capa 9: OS DPI scaling & raw input diagnostics
  getSystemDpiDiagnostics(): Result<unknown, NotImplementedCapabilityError>;

  //Capa 13: Native desktop notifications (optional)
  showSystemNotification(
    title: string,
    body: string,
  ): Result<void, NotImplementedCapabilityError>;
}

export function notImplementedInLayer(
  capability: string,
  targetLayer: number,
): Result<never, NotImplementedCapabilityError> {
  return {
    ok: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      targetLayer,
      message: `${capability} is scheduled for Layer ${String(targetLayer)}`,
    },
  };
}

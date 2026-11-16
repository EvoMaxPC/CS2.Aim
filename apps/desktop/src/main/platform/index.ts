// SPDX-License-Identifier: Apache-2.0

import os from 'node:os';
import { DarwinPlatformAdapter } from './darwin/darwin-adapter';
import { LinuxPlatformAdapter } from './linux/linux-adapter';
import type { PlatformAdapter, PlatformRuntimeProbe } from './types';
import { Win32PlatformAdapter } from './win32/win32-adapter';

export type {
  NotImplementedCapabilityError,
  PlatformAdapter,
  PlatformInfo,
  PlatformRuntimeProbe,
} from './types';

export function createDefaultRuntimeProbe(): PlatformRuntimeProbe {
  return {
    platform: process.platform,
    arch: process.arch,
    osRelease: os.release(),
    env: process.env,
  };
}

export function createPlatformAdapter(
  probe: PlatformRuntimeProbe = createDefaultRuntimeProbe(),
): PlatformAdapter {
  switch (probe.platform) {
    case 'win32':
      return new Win32PlatformAdapter(probe);
    case 'linux':
      return new LinuxPlatformAdapter(probe);
    case 'darwin':
      return new DarwinPlatformAdapter(probe);
    default:
      throw new Error(
        `Unsupported host operating system "${probe.platform}". EVO-AIM-CS2 supports win32, linux, and darwin (best-effort).`,
      );
  }
}

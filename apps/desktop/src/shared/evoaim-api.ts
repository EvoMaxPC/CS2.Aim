// SPDX-License-Identifier: Apache-2.0

import type { AppInfoResponse, NativeModulesDiagResponse } from '@evo-aim/core';

export interface EvoAimBridgeApi {
  readonly getAppInfo: () => Promise<AppInfoResponse>;
  readonly checkNativeModules: () => Promise<NativeModulesDiagResponse>;
}

declare global {
  interface Window {
    evoaim?: EvoAimBridgeApi;
  }
}

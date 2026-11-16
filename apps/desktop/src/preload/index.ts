// SPDX-License-Identifier: Apache-2.0

import {
  IPC_CHANNELS,
  IPC_CONTRACTS,
  type AppInfoResponse,
  type NativeModulesDiagResponse,
} from '@evo-aim/core';
import { contextBridge, ipcRenderer } from 'electron';
import type { EvoAimBridgeApi } from '../shared/evoaim-api';

const evoaimBridge: EvoAimBridgeApi = {
  async getAppInfo(): Promise<AppInfoResponse> {
    IPC_CONTRACTS[IPC_CHANNELS.appGetInfo].request.parse(undefined);
    const raw: unknown = await ipcRenderer.invoke(IPC_CHANNELS.appGetInfo);
    return IPC_CONTRACTS[IPC_CHANNELS.appGetInfo].response.parse(raw);
  },

  async checkNativeModules(): Promise<NativeModulesDiagResponse> {
    IPC_CONTRACTS[IPC_CHANNELS.diagNativeModules].request.parse(undefined);
    const raw: unknown = await ipcRenderer.invoke(
      IPC_CHANNELS.diagNativeModules,
    );
    return IPC_CONTRACTS[IPC_CHANNELS.diagNativeModules].response.parse(raw);
  },
};

contextBridge.exposeInMainWorld('evoaim', Object.freeze(evoaimBridge));

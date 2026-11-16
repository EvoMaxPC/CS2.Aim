// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

export interface UiShellState {
  readonly sidebarCollapsed: boolean;
  readonly runtimeErrorBanner: string | null;
  toggleSidebar: () => void;
  setRuntimeErrorBanner: (message: string | null) => void;
}

export const useUiShellStore = create<UiShellState>((set) => ({
  sidebarCollapsed: false,
  runtimeErrorBanner: null,
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  setRuntimeErrorBanner: (message) => {
    set({ runtimeErrorBanner: message });
  },
}));

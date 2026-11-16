// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

const workspaceAliases = {
  '@evo-aim/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
  '@evo-aim/data': path.resolve(__dirname, '../../packages/data/src/index.ts'),
  '@evo-aim/engine': path.resolve(
    __dirname,
    '../../packages/engine/src/index.ts',
  ),
  '@evo-aim/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
};

export default defineConfig({
  main: {
    resolve: {
      alias: workspaceAliases,
    },
    build: {
      outDir: 'out/main',
      externalizeDeps: {
        exclude: [
          '@evo-aim/core',
          '@evo-aim/data',
          '@evo-aim/engine',
          '@evo-aim/ui',
          'zod',
        ],
      },
      rollupOptions: {
        external: ['electron', 'better-sqlite3'],
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },
  preload: {
    resolve: {
      alias: workspaceAliases,
    },
    build: {
      outDir: 'out/preload',
      externalizeDeps: false,
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: workspaceAliases,
    },
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'out/renderer',
    },
  },
});

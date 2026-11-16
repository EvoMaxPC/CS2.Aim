// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const workspaceAliases = {
  '@evo-aim/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
  '@evo-aim/data': path.resolve(__dirname, 'packages/data/src/index.ts'),
  '@evo-aim/engine': path.resolve(__dirname, 'packages/engine/src/index.ts'),
  '@evo-aim/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
};

export default defineConfig({
  resolve: {
    alias: workspaceAliases,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          environment: 'node',
          include: ['packages/core/src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'data',
          environment: 'node',
          include: ['packages/data/src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'engine',
          environment: 'node',
          include: ['packages/engine/src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'ui',
          environment: 'happy-dom',
          include: ['packages/ui/src/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'desktop-main',
          environment: 'node',
          include: ['apps/desktop/src/main/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'desktop-renderer',
          environment: 'happy-dom',
          include: ['apps/desktop/src/renderer/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'tools',
          environment: 'node',
          include: ['tools/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: [
        'packages/core/src/**/*.ts',
        'packages/data/src/**/*.ts',
        'packages/engine/src/**/*.ts',
        'packages/ui/src/**/*.{ts,tsx}',
        'apps/desktop/src/main/**/*.ts',
        'apps/desktop/src/renderer/src/**/*.{ts,tsx}',
        'tools/**/*.ts',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/cli.ts',
        '**/fixtures/**',
        'apps/desktop/src/main/index.ts',
        'apps/desktop/src/renderer/src/main.tsx',
        'packages/core/src/logger.ts',
        'packages/core/src/index.ts',
        'packages/ui/src/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        'packages/core/src/**/*.ts': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
      },
    },
  },
});

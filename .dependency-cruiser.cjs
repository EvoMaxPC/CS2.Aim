// SPDX-License-Identifier: Apache-2.0
'use strict';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are prohibited across the monorepo.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'core-must-be-pure',
      severity: 'error',
      comment:
        '@evo-aim/core cannot import other workspace packages, Node built-ins, Electron, Three.js, or React (ARCHITECTURE.md).',
      from: {
        path: '^packages/core/src',
        pathNot: '\\.test\\.ts$',
      },
      to: {
        path: [
          '^packages/(data|engine|ui)/',
          '^apps/',
          '^tools/',
          '^(node:|fs$|path$|os$|child_process$|crypto$|http$|https$|electron$|three$|react$|react-dom$)',
        ],
      },
    },
    {
      name: 'data-only-depends-on-core',
      severity: 'error',
      comment: '@evo-aim/data may only import @evo-aim/core and zod.',
      from: {
        path: '^packages/data/src',
        pathNot: '\\.test\\.ts$',
      },
      to: {
        path: [
          '^packages/(engine|ui)/',
          '^apps/',
          '^tools/',
          '^(node:|fs$|path$|os$|electron$|three$|react$)',
        ],
      },
    },
    {
      name: 'engine-and-ui-are-decoupled',
      severity: 'error',
      comment:
        '@evo-aim/engine and @evo-aim/ui must never import each other or @evo-aim/desktop.',
      from: {
        path: '^packages/engine/src',
      },
      to: {
        path: [
          '^packages/ui/',
          '^apps/',
          '^(node:|fs$|path$|os$|electron$|better-sqlite3$|react$|react-dom$)',
        ],
      },
    },
    {
      name: 'ui-cannot-import-engine-or-desktop-or-node',
      severity: 'error',
      comment:
        '@evo-aim/ui must stay decoupled from @evo-aim/engine, Electron, and Node.js.',
      from: {
        path: '^packages/ui/src',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: [
          '^packages/engine/',
          '^apps/',
          '^(node:|fs$|path$|os$|electron$|better-sqlite3$|three$)',
        ],
      },
    },
    {
      name: 'renderer-cannot-import-main-or-node',
      severity: 'error',
      comment:
        'Electron renderer runs sandboxed and cannot import main/preload modules, Electron APIs, or Node.js modules.',
      from: {
        path: '^apps/desktop/src/renderer',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: [
          '^apps/desktop/src/(main|preload)/',
          '^(node:|fs$|path$|os$|child_process$|electron$|better-sqlite3$)',
        ],
      },
    },
    {
      name: 'preload-cannot-import-main-or-renderer',
      severity: 'error',
      comment:
        'Preload script must stay minimal and only share contracts from @evo-aim/core or src/shared.',
      from: {
        path: '^apps/desktop/src/preload',
      },
      to: {
        path: ['^apps/desktop/src/(main|renderer)/', '^better-sqlite3$'],
      },
    },
    {
      name: 'os-specific-platform-implementations-encapsulated',
      severity: 'error',
      comment:
        'Direct imports of win32/linux/darwin adapters outside apps/desktop/src/main/platform/index.ts are forbidden (ADR-0011).',
      from: {
        path: '^(apps|packages)/',
        pathNot:
          '^apps/desktop/src/main/platform/(index\\.ts|(win32|linux|darwin)/)',
      },
      to: {
        path: '^apps/desktop/src/main/platform/(win32|linux|darwin)/',
      },
    },
    {
      name: 'os-probe-restricted-to-platform-and-logging',
      severity: 'error',
      comment:
        'Direct usage of node:os or child_process in application packages outside PlatformAdapter/structured-logger is forbidden (ADR-0011).',
      from: {
        path: '^(apps|packages)/',
        pathNot:
          '^(apps/desktop/src/main/(platform|logging)/|.*\\.test\\.tsx?$)',
      },
      to: {
        path: '^(node:os|os|node:child_process|child_process)$',
      },
    },
  ],
  options: {
    exclude: {
      path: '(^|/)(dist|out|release|coverage|node_modules)(/|$)',
    },
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'default'],
      mainFields: ['module', 'main'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'],
    },
  },
};

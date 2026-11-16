// SPDX-License-Identifier: Apache-2.0

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      '**/release/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'eslint.config.mjs',
      'apps/desktop/scripts/*.cjs',
      '.dependency-cruiser.cjs',
      'commitlint.config.cjs',
      'tools/deps-check/fixtures/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: [
          './packages/core/tsconfig.json',
          './packages/data/tsconfig.json',
          './packages/engine/tsconfig.json',
          './packages/ui/tsconfig.json',
          './apps/desktop/tsconfig.node.json',
          './apps/desktop/tsconfig.web.json',
          './tsconfig.tools.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['packages/core/**/*.ts', 'packages/engine/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Math.random() is forbidden in @evo-aim/core and @evo-aim/engine (ADR-0005). Use the seeded deterministic PRNG.',
        },
        {
          object: 'Date',
          property: 'now',
          message:
            'Date.now() is forbidden in @evo-aim/core and @evo-aim/engine (ADR-0005). Pass explicit timestamps.',
        },
      ],
    },
  },
  {
    files: [
      'packages/ui/**/*.{ts,tsx}',
      'apps/desktop/src/renderer/**/*.{ts,tsx}',
    ],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  eslintConfigPrettier,
);

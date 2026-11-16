// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = path.resolve(__dirname, '../..');
const configPath = path.join(repoRoot, '.dependency-cruiser.cjs');
const depcruiseBin = path.join(
  repoRoot,
  'node_modules',
  'dependency-cruiser',
  'bin',
  'dependency-cruiser.mjs',
);

const tempWorkspaces: string[] = [];

afterEach(() => {
  for (const dir of tempWorkspaces.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function runDepcruise(
  cwd: string,
  targets: readonly string[],
): {
  readonly cliExitCode: number;
  readonly violationRuleNames: readonly string[];
} {
  const jsonOut = execFileSync(
    process.execPath,
    [depcruiseBin, ...targets, '--config', configPath, '--output-type', 'json'],
    { cwd, encoding: 'utf8' },
  );
  const parsed = JSON.parse(jsonOut) as {
    readonly summary: {
      readonly violations: ReadonlyArray<{
        readonly rule: { readonly name: string };
      }>;
    };
  };

  let cliExitCode = 0;
  try {
    execFileSync(
      process.execPath,
      [depcruiseBin, ...targets, '--config', configPath],
      { cwd, encoding: 'utf8' },
    );
  } catch (err) {
    const execErr = err as { readonly status?: number };
    cliExitCode = execErr.status ?? 1;
  }

  return {
    cliExitCode,
    violationRuleNames: parsed.summary.violations.map((v) => v.rule.name),
  };
}

describe('dependency-cruiser architectural DAG & OS boundary rules', () => {
  it(
    'passes cleanly on compliant workspace files and rejects synthetic DAG & OS-adapter violations',
    { timeout: 25_000 },
    () => {
      const tmpRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), 'evoaim-depcruise-test-'),
      );
      tempWorkspaces.push(tmpRoot);

      const writeRel = (relPath: string, content: string): void => {
        const full = path.join(tmpRoot, relPath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
      };

      writeRel(
        'tsconfig.base.json',
        JSON.stringify({ compilerOptions: { strict: true } }),
      );

      // 1. Clean baseline fixture
      writeRel('packages/core/src/math.ts', 'export const TWO = 2;\n');
      writeRel(
        'packages/ui/src/Card.ts',
        "import { TWO } from '../../core/src/math';\nexport const FOUR = TWO * 2;\n",
      );

      const cleanResult = runDepcruise(tmpRoot, ['packages']);
      expect(cleanResult.cliExitCode).toBe(0);
      expect(cleanResult.violationRuleNames).toEqual([]);

      // 2. Synthetic violation A: @evo-aim/ui importing @evo-aim/engine
      writeRel('packages/engine/src/loop.ts', 'export const FPS = 240;\n');
      writeRel(
        'packages/ui/src/IllegalImport.ts',
        "import { FPS } from '../../engine/src/loop';\nexport const X = FPS;\n",
      );

      // 3. Synthetic violation B: @evo-aim/core importing node:fs
      writeRel(
        'packages/core/src/illegal-node.ts',
        "import fs from 'node:fs';\nexport const exists = fs.existsSync;\n",
      );

      // 4. Synthetic violation C: main IPC handler directly importing win32 adapter
      writeRel(
        'apps/desktop/src/main/platform/win32/win32-adapter.ts',
        'export const WIN = true;\n',
      );
      writeRel(
        'apps/desktop/src/main/ipc/illegal-os.ts',
        "import { WIN } from '../platform/win32/win32-adapter';\nexport const Y = WIN;\n",
      );

      const violatedResult = runDepcruise(tmpRoot, ['packages', 'apps']);
      expect(violatedResult.cliExitCode).not.toBe(0);
      expect(violatedResult.violationRuleNames).toContain(
        'ui-cannot-import-engine-or-desktop-or-node',
      );
      expect(violatedResult.violationRuleNames).toContain('core-must-be-pure');
      expect(violatedResult.violationRuleNames).toContain(
        'os-specific-platform-implementations-encapsulated',
      );
    },
  );
});

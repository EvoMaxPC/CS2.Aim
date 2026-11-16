// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { scanLineForOwnerValues, scanWorkspaceForOwnerValues } from './scanner';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('tools/check-no-owner-values privacy & legacy-identifier scanner', () => {
  it('detects Windows/POSIX personal paths, private LAN IPs, secret tokens, and legacy names', () => {
    const legacyAppId = ['app', '.', 'evoaim', '.', 'cs2'].join('');
    const legacyRepo = ['CS2', '.', 'Aim'].join('');
    const sampleToken = `ghp_${'A1b2C3d4E5f6G7h8I9j0K1l2M3n4'}`;

    expect(
      scanLineForOwnerValues('Path C:\\Users\\JuanPerez\\AppData\\Roaming')[0]
        ?.ruleId,
    ).toBe('windows-personal-path');
    expect(
      scanLineForOwnerValues('Loaded from /home/juanperez/.config/evo')[0]
        ?.ruleId,
    ).toBe('posix-personal-path');
    expect(
      scanLineForOwnerValues('Connected to 192.168.1.44:3000')[0]?.ruleId,
    ).toBe('private-lan-ip');
    expect(
      scanLineForOwnerValues(`Authorization ${sampleToken}`)[0]?.ruleId,
    ).toBe('secret-token');
    expect(scanLineForOwnerValues(`Old id ${legacyAppId}`)[0]?.ruleId).toBe(
      'forbidden-legacy-identifier',
    );
    expect(scanLineForOwnerValues(`Old slug ${legacyRepo}`)[0]?.ruleId).toBe(
      'forbidden-legacy-identifier',
    );

    // Allowed sanitized placeholders must pass cleanly
    expect(
      scanLineForOwnerValues(
        'Sanitized path <USER_HOME>/AppData and C:\\Users\\<TuNombre> and 127.0.0.1',
      ),
    ).toEqual([]);
  });

  it('scans temporary directories and passes on the real EVO-AIM-CS2 repository', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'evoaim-no-owner-'));
    tempDirs.push(tmp);

    fs.writeFileSync(
      path.join(tmp, 'clean.md'),
      '# EVO-AIM-CS2\nappId: io.github.evomaxpc.evoaim\n',
      'utf8',
    );
    expect(scanWorkspaceForOwnerValues(tmp).ok).toBe(true);

    fs.writeFileSync(
      path.join(tmp, 'leak.ts'),
      'export const host = "10.0.0.25";\n',
      'utf8',
    );
    const failed = scanWorkspaceForOwnerValues(tmp, {
      allowSelfExemptions: false,
    });
    expect(failed.ok).toBe(false);
    expect(failed.violations[0]?.ruleId).toBe('private-lan-ip');

    const repoRoot = path.resolve(__dirname, '../..');
    const repoAudit = scanWorkspaceForOwnerValues(repoRoot);
    expect(repoAudit.violations).toEqual([]);
    expect(repoAudit.ok).toBe(true);
  });
});

// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  collectBaselineReport,
  measureDirectoryBytes,
  probeNativeSqliteInNode,
} from './baseline';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('tools/baseline artifact & runtime collector', () => {
  it('measures nested directory byte sizes, probes SQLite in repo root, and handles missing directories cleanly', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evoaim-baseline-'));
    tempDirs.push(root);

    expect(measureDirectoryBytes(path.join(root, 'missing'))).toEqual({
      path: path.join(root, 'missing'),
      exists: false,
      fileCount: 0,
      totalBytes: 0,
    });

    const outMain = path.join(root, 'apps', 'desktop', 'out', 'main');
    fs.mkdirSync(outMain, { recursive: true });
    fs.writeFileSync(path.join(outMain, 'index.js'), 'x'.repeat(512), 'utf8');

    const report = collectBaselineReport(root, '2026-11-13T00:00:00.000Z');
    expect(report.schemaVersion).toBe(1);
    expect(report.environment.capturedAtIso).toBe('2026-11-13T00:00:00.000Z');
    expect(report.buildArtifacts.desktopOutMain.exists).toBe(true);
    expect(report.buildArtifacts.desktopOutMain.fileCount).toBe(1);
    expect(report.buildArtifacts.desktopOutMain.totalBytes).toBe(512);
    expect(report.electronRuntimeProbe.binaryPresent).toBe(false);

    // Probe real better-sqlite3 inside actual workspace
    const realRepoRoot = path.resolve(__dirname, '../..');
    const sqliteProbe = probeNativeSqliteInNode(realRepoRoot);
    expect(sqliteProbe.ok).toBe(true);
    expect(sqliteProbe.bindingAvailable).toBe(true);
  });
});

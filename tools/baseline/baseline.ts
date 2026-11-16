// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface DirectorySizeMetrics {
  readonly path: string;
  readonly exists: boolean;
  readonly fileCount: number;
  readonly totalBytes: number;
}

export interface BaselineEnvironmentSnapshot {
  readonly capturedAtIso: string;
  readonly platform: NodeJS.Platform;
  readonly arch: string;
  readonly osRelease: string;
  readonly nodeVersion: string;
  readonly cpuModel: string;
  readonly cpuLogicalCores: number;
  readonly totalMemoryBytes: number;
  readonly processRssBytes: number;
  readonly processHeapUsedBytes: number;
}

export interface BaselineArtifactReport {
  readonly schemaVersion: 1;
  readonly environment: BaselineEnvironmentSnapshot;
  readonly buildArtifacts: {
    readonly packagesCoreDist: DirectorySizeMetrics;
    readonly packagesDataDist: DirectorySizeMetrics;
    readonly packagesEngineDist: DirectorySizeMetrics;
    readonly packagesUiDist: DirectorySizeMetrics;
    readonly desktopOutMain: DirectorySizeMetrics;
    readonly desktopOutPreload: DirectorySizeMetrics;
    readonly desktopOutRenderer: DirectorySizeMetrics;
    readonly desktopReleaseDir: DirectorySizeMetrics;
  };
  readonly electronRuntimeProbe: {
    readonly binaryPresent: boolean;
    readonly binaryPath: string | null;
    readonly note: string;
  };
  readonly nativeSqliteProbe: {
    readonly ok: boolean;
    readonly bindingAvailable: boolean;
    readonly detail: string;
  };
}

export function measureDirectoryBytes(targetDir: string): DirectorySizeMetrics {
  if (!fs.existsSync(targetDir)) {
    return {
      path: targetDir,
      exists: false,
      fileCount: 0,
      totalBytes: 0,
    };
  }

  let fileCount = 0;
  let totalBytes = 0;

  const walk = (current: string): void => {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        fileCount += 1;
        totalBytes += fs.statSync(fullPath).size;
      }
    }
  };

  walk(targetDir);
  return {
    path: targetDir,
    exists: true,
    fileCount,
    totalBytes,
  };
}

export function probeNativeSqliteInNode(repoRoot: string): {
  readonly ok: boolean;
  readonly bindingAvailable: boolean;
  readonly detail: string;
} {
  try {
    const probeScript = `
      const Database = require('better-sqlite3');
      const db = new Database(':memory:');
      db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, label TEXT NOT NULL);');
      db.prepare('INSERT INTO t (label) VALUES (?)').run('baseline-ok');
      const row = db.prepare('SELECT label FROM t WHERE id = 1').get();
      db.close();
      process.stdout.write(JSON.stringify({ ok: row && row.label === 'baseline-ok' }));
    `;
    const desktopDir = path.join(repoRoot, 'apps', 'desktop');
    const out = execFileSync(process.execPath, ['-e', probeScript], {
      cwd: fs.existsSync(desktopDir) ? desktopDir : repoRoot,
      encoding: 'utf8',
    });
    const parsed = JSON.parse(out) as { readonly ok?: boolean };
    return {
      ok: parsed.ok === true,
      bindingAvailable: true,
      detail:
        parsed.ok === true
          ? 'better-sqlite3 (:memory:) CREATE/INSERT/SELECT verified in Node host process.'
          : 'Unexpected query response.',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      bindingAvailable: false,
      detail: `better-sqlite3 probe could not run in current Node host: ${message.split('\n')[0] ?? message}`,
    };
  }
}

export function collectBaselineReport(
  repoRoot: string,
  nowIso: string = new Date().toISOString(),
): BaselineArtifactReport {
  const cpus = os.cpus();
  const mem = process.memoryUsage();

  const rel = (...segments: string[]): DirectorySizeMetrics => {
    const abs = path.join(repoRoot, ...segments);
    const measured = measureDirectoryBytes(abs);
    return {
      ...measured,
      path: segments.join('/'),
    };
  };

  const electronDistDir = path.join(
    repoRoot,
    'node_modules',
    'electron',
    'dist',
  );
  const electronBinaryCandidate =
    process.platform === 'win32'
      ? path.join(electronDistDir, 'electron.exe')
      : process.platform === 'darwin'
        ? path.join(
            electronDistDir,
            'Electron.app',
            'Contents',
            'MacOS',
            'Electron',
          )
        : path.join(electronDistDir, 'electron');
  const binaryPresent = fs.existsSync(electronBinaryCandidate);

  return {
    schemaVersion: 1,
    environment: {
      capturedAtIso: nowIso,
      platform: process.platform,
      arch: process.arch,
      osRelease: os.release(),
      nodeVersion: process.version,
      cpuModel: cpus[0]?.model ?? 'unknown',
      cpuLogicalCores: cpus.length,
      totalMemoryBytes: os.totalmem(),
      processRssBytes: mem.rss,
      processHeapUsedBytes: mem.heapUsed,
    },
    buildArtifacts: {
      packagesCoreDist: rel('packages', 'core', 'dist'),
      packagesDataDist: rel('packages', 'data', 'dist'),
      packagesEngineDist: rel('packages', 'engine', 'dist'),
      packagesUiDist: rel('packages', 'ui', 'dist'),
      desktopOutMain: rel('apps', 'desktop', 'out', 'main'),
      desktopOutPreload: rel('apps', 'desktop', 'out', 'preload'),
      desktopOutRenderer: rel('apps', 'desktop', 'out', 'renderer'),
      desktopReleaseDir: rel('apps', 'desktop', 'release'),
    },
    electronRuntimeProbe: {
      binaryPresent,
      binaryPath: binaryPresent
        ? path.relative(repoRoot, electronBinaryCandidate)
        : null,
      note: binaryPresent
        ? 'Electron binary present on disk; cold-start & idle RSS measured via CI/E2E or local desktop session.'
        : 'Electron binary not downloaded in restricted environment (ELECTRON_SKIP_BINARY_DOWNLOAD=1); cold-start/RSS requires GitHub Actions CI or local workstation.',
    },
    nativeSqliteProbe: probeNativeSqliteInNode(repoRoot),
  };
}

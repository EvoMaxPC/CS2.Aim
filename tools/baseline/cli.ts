// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import { collectBaselineReport } from './baseline';

function formatKiB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function main(): void {
  const repoRoot = path.resolve(__dirname, '../..');
  const outputPathArg = process.argv[2];
  const report = collectBaselineReport(repoRoot);

  if (outputPathArg !== undefined && outputPathArg.trim().length > 0) {
    const resolvedOut = path.resolve(repoRoot, outputPathArg);
    fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
    fs.writeFileSync(
      resolvedOut,
      `${JSON.stringify(report, null, 2)}\n`,
      'utf8',
    );
    process.stdout.write(`[baseline] JSON report written to ${resolvedOut}\n`);
  }

  process.stdout.write(
    `[baseline] Host: ${report.environment.platform}-${report.environment.arch} (${report.environment.osRelease}), Node ${report.environment.nodeVersion}, CPU="${report.environment.cpuModel}" (${String(report.environment.cpuLogicalCores)} cores)\n`,
  );
  process.stdout.write(
    `[baseline] Build bundles: main=${formatKiB(report.buildArtifacts.desktopOutMain.totalBytes)}, preload=${formatKiB(report.buildArtifacts.desktopOutPreload.totalBytes)}, renderer=${formatKiB(report.buildArtifacts.desktopOutRenderer.totalBytes)}\n`,
  );
  process.stdout.write(
    `[baseline] SQLite probe: ok=${String(report.nativeSqliteProbe.ok)} (${report.nativeSqliteProbe.detail})\n`,
  );
  process.stdout.write(
    `[baseline] Electron binary: present=${String(report.electronRuntimeProbe.binaryPresent)} (${report.electronRuntimeProbe.note})\n`,
  );
}

main();

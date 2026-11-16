// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  type LicenseExceptionsConfig,
  type PnpmLicensesJsonOutput,
  auditPnpmLicenses,
} from './license-policy';

function main(): void {
  const repoRoot = path.resolve(__dirname, '../..');
  const exceptionsPath = path.join(__dirname, 'exceptions.json');
  const exceptions = JSON.parse(
    fs.readFileSync(exceptionsPath, 'utf8'),
  ) as LicenseExceptionsConfig;

  const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const rawJson = execFileSync(pnpmCmd, ['licenses', 'list', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    shell: process.platform === 'win32',
  });

  const parsed = JSON.parse(rawJson) as PnpmLicensesJsonOutput;
  const report = auditPnpmLicenses(parsed, exceptions);

  process.stdout.write(
    `[licenses:check] Checked ${String(report.totalPackagesChecked)} packages (${String(report.allowedCount)} permissive, ${String(report.reviewedExceptionCount)} reviewed MPL-2.0 exceptions).\n`,
  );

  if (!report.ok) {
    process.stderr.write(
      `[licenses:check] FAILED with ${String(report.issues.length)} policy violation(s):\n`,
    );
    for (const issue of report.issues) {
      process.stderr.write(
        `  - [${issue.category}] ${issue.packageName}@${issue.versions.join(',')} (${issue.licenseExpression}): ${issue.reason}\n`,
      );
    }
    process.exit(1);
  }

  process.stdout.write(
    '[licenses:check] OK — 0 forbidden or unknown licenses.\n',
  );
}

main();

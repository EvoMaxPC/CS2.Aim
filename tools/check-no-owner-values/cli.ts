// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import { scanWorkspaceForOwnerValues } from './scanner';

function main(): void {
  const repoRoot = path.resolve(__dirname, '../..');
  const result = scanWorkspaceForOwnerValues(repoRoot);

  process.stdout.write(
    `[no-owner:check] Scanned ${String(result.scannedFilesCount)} repository text files.\n`,
  );

  if (!result.ok) {
    process.stderr.write(
      `[no-owner:check] FAILED with ${String(result.violations.length)} hygiene/privacy violation(s):\n`,
    );
    for (const v of result.violations) {
      process.stderr.write(
        `  - ${v.filePath}:${String(v.lineNumber)} [${v.ruleId}] -> ${v.excerpt}\n`,
      );
    }
    process.exit(1);
  }

  process.stdout.write(
    '[no-owner:check] OK — 0 personal paths, LAN IPs, secret tokens, or legacy identifiers.\n',
  );
}

main();

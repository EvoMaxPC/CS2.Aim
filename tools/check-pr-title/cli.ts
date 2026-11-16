// SPDX-License-Identifier: Apache-2.0

import { validatePrTitle } from './pr-title';

function main(): void {
  const title = process.argv[2] ?? process.env['PR_TITLE'] ?? '';
  const verdict = validatePrTitle(title);

  if (!verdict.ok) {
    process.stderr.write(
      `[pr-title:check] INVALID PR title "${title}": ${verdict.reason ?? 'Unknown error'}\n`,
    );
    process.exit(1);
  }

  process.stdout.write(`[pr-title:check] OK — "${title}"\n`);
}

main();

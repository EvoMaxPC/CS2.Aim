// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import {
  type BotAllowlistConfig,
  readGitRangeCommits,
  verifyCommitsDco,
} from './dco-checker';

function main(): void {
  const repoRoot = path.resolve(__dirname, '../..');
  const rangeArg = process.argv[2] ?? 'HEAD~1..HEAD';
  const allowlistPath = path.join(__dirname, 'bot-allowlist.json');
  const allowlist = JSON.parse(
    fs.readFileSync(allowlistPath, 'utf8'),
  ) as BotAllowlistConfig;

  const commits = readGitRangeCommits(repoRoot, rangeArg);
  const result = verifyCommitsDco(commits, allowlist);

  process.stdout.write(
    `[dco:check] Range "${rangeArg}": checked=${String(result.checkedCount)}, skippedMerges=${String(result.skippedMergeCount)}, skippedBots=${String(result.skippedBotCount)}\n`,
  );

  if (!result.ok) {
    process.stderr.write('[dco:check] FAILED:\n');
    for (const f of result.failures) {
      process.stderr.write(
        `  - ${f.sha.slice(0, 8)} "${f.subject}": ${f.reason}\n`,
      );
    }
    process.exit(1);
  }

  process.stdout.write(
    '[dco:check] OK — all checked commits carry valid DCO sign-off.\n',
  );
}

main();

// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readGitRangeCommits, verifyCommitsDco } from './dco-checker';

const tempRepos: string[] = [];

afterEach(() => {
  for (const dir of tempRepos.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('tools/check-dco over temporary Git repositories', () => {
  const allowlist = {
    schemaVersion: 1 as const,
    allowedBotEmails: ['49699333+dependabot[bot]@users.noreply.github.com'],
    allowedBotNames: ['dependabot[bot]'],
  };

  it('passes signed commits, ignores merge & bot commits, and fails unsigned/mismatched commits', () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evoaim-dco-test-'));
    tempRepos.push(repoDir);

    const git = (...args: string[]): string =>
      execFileSync('git', args, { cwd: repoDir, encoding: 'utf8' }).trim();

    git('init', '-b', 'main');
    git('config', 'user.name', 'Test Contributor');
    git('config', 'user.email', 'contributor@example.com');

    fs.writeFileSync(path.join(repoDir, 'a.txt'), 'base\n');
    git('add', 'a.txt');
    git('commit', '-s', '-m', 'chore(infra): base commit');
    const baseSha = git('rev-parse', 'HEAD');

    // Valid signed commit
    fs.writeFileSync(path.join(repoDir, 'b.txt'), 'valid\n');
    git('add', 'b.txt');
    git('commit', '-s', '-m', 'feat(core): signed feature');

    // Bot commit without DCO (should be exempted)
    fs.writeFileSync(path.join(repoDir, 'bot.txt'), 'bump\n');
    git('add', 'bot.txt');
    execFileSync('git', ['commit', '-m', 'chore(infra): bump dependency'], {
      cwd: repoDir,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'dependabot[bot]',
        GIT_AUTHOR_EMAIL: '49699333+dependabot[bot]@users.noreply.github.com',
        GIT_COMMITTER_NAME: 'dependabot[bot]',
        GIT_COMMITTER_EMAIL:
          '49699333+dependabot[bot]@users.noreply.github.com',
      },
    });

    const goodCommits = readGitRangeCommits(repoDir, `${baseSha}..HEAD`);
    const goodResult = verifyCommitsDco(goodCommits, allowlist);
    expect(goodResult.ok).toBe(true);
    expect(goodResult.checkedCount).toBe(1);
    expect(goodResult.skippedBotCount).toBe(1);

    // Unsigned commit (should fail)
    fs.writeFileSync(path.join(repoDir, 'unsigned.txt'), 'oops\n');
    git('add', 'unsigned.txt');
    git('commit', '-m', 'fix(core): forgot signoff');

    const badCommits = readGitRangeCommits(repoDir, `${baseSha}..HEAD`);
    const badResult = verifyCommitsDco(badCommits, allowlist);
    expect(badResult.ok).toBe(false);
    expect(badResult.failures).toHaveLength(1);
    expect(badResult.failures[0]?.reason).toContain('Missing "Signed-off-by');

    // Mismatched email sign-off
    const mismatch = verifyCommitsDco(
      [
        {
          sha: '1234567890abcdef',
          authorName: 'Alice',
          authorEmail: 'alice@example.com',
          parentCount: 1,
          subject: 'feat(ui): add card',
          body: 'feat(ui): add card\n\nSigned-off-by: Bob <bob@example.com>\n',
        },
        {
          sha: 'fedcba0987654321',
          authorName: 'Merge',
          authorEmail: 'alice@example.com',
          parentCount: 2,
          subject: 'Merge branch',
          body: 'Merge branch\n',
        },
      ],
      allowlist,
    );
    expect(mismatch.ok).toBe(false);
    expect(mismatch.skippedMergeCount).toBe(1);
  });
});

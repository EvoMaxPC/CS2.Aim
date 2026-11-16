// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';

export interface DcoCommitEntry {
  readonly sha: string;
  readonly authorName: string;
  readonly authorEmail: string;
  readonly parentCount: number;
  readonly subject: string;
  readonly body: string;
}

export interface BotAllowlistConfig {
  readonly schemaVersion: 1;
  readonly allowedBotEmails: readonly string[];
  readonly allowedBotNames: readonly string[];
}

export interface DcoAuditFailure {
  readonly sha: string;
  readonly subject: string;
  readonly reason: string;
}

export interface DcoAuditResult {
  readonly ok: boolean;
  readonly checkedCount: number;
  readonly skippedMergeCount: number;
  readonly skippedBotCount: number;
  readonly failures: readonly DcoAuditFailure[];
}

const SIGNED_OFF_BY_REGEX =
  /^Signed-off-by:\s*(.+?)\s*<([^<>\s]+@[^<>\s]+)>\s*$/gim;

export function verifyCommitsDco(
  commits: readonly DcoCommitEntry[],
  botAllowlist: BotAllowlistConfig,
): DcoAuditResult {
  const botEmails = new Set(
    botAllowlist.allowedBotEmails.map((e) => e.toLowerCase()),
  );
  const botNames = new Set(
    botAllowlist.allowedBotNames.map((n) => n.toLowerCase()),
  );

  let checkedCount = 0;
  let skippedMergeCount = 0;
  let skippedBotCount = 0;
  const failures: DcoAuditFailure[] = [];

  for (const commit of commits) {
    if (commit.parentCount > 1) {
      skippedMergeCount += 1;
      continue;
    }

    if (
      botEmails.has(commit.authorEmail.toLowerCase()) ||
      botNames.has(commit.authorName.toLowerCase())
    ) {
      skippedBotCount += 1;
      continue;
    }

    checkedCount += 1;
    const trailers = Array.from(
      commit.body.matchAll(SIGNED_OFF_BY_REGEX),
      (m) => ({
        name: (m[1] ?? '').trim(),
        email: (m[2] ?? '').trim().toLowerCase(),
      }),
    );

    if (trailers.length === 0) {
      failures.push({
        sha: commit.sha,
        subject: commit.subject,
        reason:
          'Missing "Signed-off-by: Name <email>" trailer (use git commit -s).',
      });
      continue;
    }

    const authorEmailLower = commit.authorEmail.toLowerCase();
    const matchingAuthorSignoff = trailers.some(
      (t) => t.email === authorEmailLower,
    );

    if (!matchingAuthorSignoff) {
      failures.push({
        sha: commit.sha,
        subject: commit.subject,
        reason: `Signed-off-by email does not match commit author email <${commit.authorEmail}>.`,
      });
    }
  }

  return {
    ok: failures.length === 0,
    checkedCount,
    skippedMergeCount,
    skippedBotCount,
    failures,
  };
}

export function readGitRangeCommits(
  cwd: string,
  revisionRange: string,
): readonly DcoCommitEntry[] {
  const recordSep = '\x1e';
  const fieldSep = '\x1f';
  const format = `%H${fieldSep}%an${fieldSep}%ae${fieldSep}%P${fieldSep}%s${fieldSep}%B${recordSep}`;

  const raw = execFileSync(
    'git',
    ['log', `--format=${format}`, revisionRange],
    {
      cwd,
      encoding: 'utf8',
    },
  );

  return raw
    .split(recordSep)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => {
      const parts = chunk.split(fieldSep);
      const parentsRaw = (parts[3] ?? '').trim();
      const parentCount =
        parentsRaw.length === 0 ? 0 : parentsRaw.split(/\s+/).length;
      return {
        sha: parts[0] ?? '',
        authorName: parts[1] ?? '',
        authorEmail: parts[2] ?? '',
        parentCount,
        subject: parts[4] ?? '',
        body: parts[5] ?? '',
      };
    });
}

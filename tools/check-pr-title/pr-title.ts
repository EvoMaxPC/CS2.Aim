// SPDX-License-Identifier: Apache-2.0

export const ALLOWED_COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'test',
  'refactor',
  'perf',
  'build',
  'ci',
  'chore',
] as const;

export const ALLOWED_COMMIT_SCOPES = [
  'core',
  'data',
  'engine',
  'ui',
  'desktop',
  'platform',
  'infra',
  'docs',
] as const;

const PR_TITLE_REGEX =
  /^(?<type>[a-z]+)(?:\((?<scope>[a-z0-9-]+)\))?(?<breaking>!)?:\s(?<subject>\S.*)$/;

export interface PrTitleValidationResult {
  readonly ok: boolean;
  readonly reason?: string;
}

export function validatePrTitle(rawTitle: string): PrTitleValidationResult {
  const title = rawTitle.trim();
  if (title.length === 0) {
    return { ok: false, reason: 'PR title must not be empty.' };
  }
  if (title.length > 110) {
    return {
      ok: false,
      reason: `PR title exceeds 110 characters (${String(title.length)}).`,
    };
  }

  const match = PR_TITLE_REGEX.exec(title);
  if (match === null || match.groups === undefined) {
    return {
      ok: false,
      reason:
        'PR title must follow Conventional Commits: "<type>(<scope>): <summary>" or "<type>: <summary>".',
    };
  }

  const commitType = match.groups['type'] ?? '';
  const scope = match.groups['scope'];
  const subject = match.groups['subject'] ?? '';

  if (!(ALLOWED_COMMIT_TYPES as readonly string[]).includes(commitType)) {
    return {
      ok: false,
      reason: `Unknown type "${commitType}". Allowed: ${ALLOWED_COMMIT_TYPES.join(', ')}.`,
    };
  }

  if (
    scope !== undefined &&
    !(ALLOWED_COMMIT_SCOPES as readonly string[]).includes(scope)
  ) {
    return {
      ok: false,
      reason: `Unknown scope "${scope}". Allowed: ${ALLOWED_COMMIT_SCOPES.join(', ')}.`,
    };
  }

  if (subject.endsWith('.')) {
    return {
      ok: false,
      reason: 'PR title summary should not end with a trailing period.',
    };
  }

  return { ok: true };
}

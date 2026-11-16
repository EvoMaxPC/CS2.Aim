// SPDX-License-Identifier: Apache-2.0

export interface PnpmLicensePackageEntry {
  readonly name: string;
  readonly versions?: readonly string[];
  readonly version?: string;
  readonly license?: string;
}

export type PnpmLicensesJsonOutput = Readonly<
  Record<string, readonly PnpmLicensePackageEntry[]>
>;

export interface ReviewedPackageException {
  readonly name: string;
  readonly license: string;
  readonly reason: string;
}

export interface LicenseExceptionsConfig {
  readonly schemaVersion: 1;
  readonly reviewedPackages: readonly ReviewedPackageException[];
}

export interface LicenseAuditIssue {
  readonly packageName: string;
  readonly versions: readonly string[];
  readonly licenseExpression: string;
  readonly category: 'forbidden' | 'manual-review-required' | 'unknown';
  readonly reason: string;
}

export interface LicenseAuditReport {
  readonly ok: boolean;
  readonly totalPackagesChecked: number;
  readonly allowedCount: number;
  readonly reviewedExceptionCount: number;
  readonly issues: readonly LicenseAuditIssue[];
}

export const STRICTLY_ALLOWED_LICENSES: ReadonlySet<string> = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'BlueOak-1.0.0',
  'Python-2.0',
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-3.0',
  'Unlicense',
  'WTFPL',
  'Zlib',
]);

const FORBIDDEN_LICENSE_TOKENS = [
  'GPL',
  'AGPL',
  'LGPL',
  'SSPL',
  'EUPL',
  'CPAL',
  'OSL',
  'PROPRIETARY',
  'UNLICENSED',
  'UNKNOWN',
] as const;

function splitCompoundExpression(expr: string): {
  readonly mode: 'single' | 'or' | 'and' | 'complex';
  readonly parts: readonly string[];
} {
  const cleaned = expr
    .trim()
    .replace(/^\(+|\)+$/g, '')
    .trim();
  if (cleaned.length === 0) {
    return { mode: 'complex', parts: [] };
  }

  // Handle nested OR/AND conservatively: if both appear, only allow if an OR branch is clean
  if (cleaned.includes(' OR ') && !cleaned.includes(' AND ')) {
    return {
      mode: 'or',
      parts: cleaned
        .split(/\s+OR\s+/)
        .map((s) => s.replace(/[()]/g, '').trim()),
    };
  }

  if (cleaned.includes(' AND ') && !cleaned.includes(' OR ')) {
    return {
      mode: 'and',
      parts: cleaned
        .split(/\s+AND\s+/)
        .map((s) => s.replace(/[()]/g, '').trim()),
    };
  }

  if (cleaned.includes(' OR ') && cleaned.includes(' AND ')) {
    return { mode: 'complex', parts: [cleaned] };
  }

  // Legacy slash notation like "MIT/X11" or "(MIT OR Apache-2.0)"
  if (!cleaned.includes(' ')) {
    return { mode: 'single', parts: [cleaned] };
  }

  return { mode: 'complex', parts: [cleaned] };
}

function classifySingleLicenseToken(
  token: string,
): 'allowed' | 'mpl-review' | 'forbidden' | 'unknown' {
  if (STRICTLY_ALLOWED_LICENSES.has(token)) {
    return 'allowed';
  }
  if (token === 'MPL-2.0') {
    return 'mpl-review';
  }
  const upper = token.toUpperCase();
  for (const forbidden of FORBIDDEN_LICENSE_TOKENS) {
    if (upper.includes(forbidden)) {
      return 'forbidden';
    }
  }
  return 'unknown';
}

export function evaluateLicenseExpression(
  rawExpression: string,
): 'allowed' | 'mpl-review' | 'forbidden' | 'unknown' {
  const normalized = rawExpression.trim();
  if (normalized.length === 0) {
    return 'forbidden';
  }

  const split = splitCompoundExpression(normalized);
  if (split.mode === 'single') {
    const first = split.parts[0] ?? '';
    return classifySingleLicenseToken(first);
  }

  if (split.mode === 'or') {
    const statuses = split.parts.map(classifySingleLicenseToken);
    // In dual-licensing (e.g. "MIT OR GPL-3.0"), we elect the permissive option
    if (statuses.includes('allowed')) {
      return 'allowed';
    }
    if (statuses.includes('mpl-review')) {
      return 'mpl-review';
    }
    if (statuses.includes('forbidden')) {
      return 'forbidden';
    }
    return 'unknown';
  }

  if (split.mode === 'and') {
    const statuses = split.parts.map(classifySingleLicenseToken);
    if (statuses.includes('forbidden')) {
      return 'forbidden';
    }
    if (statuses.includes('unknown')) {
      return 'unknown';
    }
    if (statuses.includes('mpl-review')) {
      return 'mpl-review';
    }
    return 'allowed';
  }

  const upper = normalized.toUpperCase();
  for (const forbidden of FORBIDDEN_LICENSE_TOKENS) {
    if (upper.includes(forbidden)) {
      return 'forbidden';
    }
  }
  return 'unknown';
}

export function auditPnpmLicenses(
  licensesBySpdx: PnpmLicensesJsonOutput,
  exceptionsConfig: LicenseExceptionsConfig,
): LicenseAuditReport {
  const exceptionMap = new Map<string, ReviewedPackageException>();
  for (const item of exceptionsConfig.reviewedPackages) {
    exceptionMap.set(`${item.name}::${item.license}`, item);
  }

  let totalPackagesChecked = 0;
  let allowedCount = 0;
  let reviewedExceptionCount = 0;
  const issues: LicenseAuditIssue[] = [];

  for (const [licenseGroupKey, entries] of Object.entries(licensesBySpdx)) {
    for (const pkg of entries) {
      totalPackagesChecked += 1;
      const licenseExpr = (pkg.license ?? licenseGroupKey).trim();
      const versions =
        pkg.versions ?? (pkg.version !== undefined ? [pkg.version] : []);
      const verdict = evaluateLicenseExpression(licenseExpr);

      if (verdict === 'allowed') {
        allowedCount += 1;
        continue;
      }

      const exceptionKey = `${pkg.name}::${licenseExpr}`;
      if (verdict === 'mpl-review' && exceptionMap.has(exceptionKey)) {
        reviewedExceptionCount += 1;
        continue;
      }

      if (verdict === 'mpl-review') {
        issues.push({
          packageName: pkg.name,
          versions,
          licenseExpression: licenseExpr,
          category: 'manual-review-required',
          reason:
            'MPL-2.0 requires explicit review and entry in tools/check-licenses/exceptions.json (ADR-0014).',
        });
      } else if (verdict === 'forbidden') {
        issues.push({
          packageName: pkg.name,
          versions,
          licenseExpression: licenseExpr,
          category: 'forbidden',
          reason:
            'Copyleft / proprietary / unlicensed dependency is prohibited by ADR-0014.',
        });
      } else {
        issues.push({
          packageName: pkg.name,
          versions,
          licenseExpression: licenseExpr,
          category: 'unknown',
          reason:
            'Unrecognized SPDX expression; silent approval is forbidden. Classify or add a reviewed exception.',
        });
      }
    }
  }

  return {
    ok: issues.length === 0,
    totalPackagesChecked,
    allowedCount,
    reviewedExceptionCount,
    issues,
  };
}

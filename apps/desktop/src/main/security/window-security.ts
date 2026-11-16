// SPDX-License-Identifier: Apache-2.0

import type { WebPreferences } from 'electron';
import { APP_PROTOCOL_ORIGIN } from './protocol-path';

export const ALLOWED_EXTERNAL_HTTPS_ORIGINS: ReadonlySet<string> = new Set([
  'https://github.com',
]);

export const ALLOWED_EXTERNAL_PATH_PREFIX = '/EvoMaxPC/evo-aim-cs2';

export function buildContentSecurityPolicy(options: {
  readonly isDev: boolean;
  readonly devServerOrigin?: string;
}): string {
  if (options.isDev && options.devServerOrigin !== undefined) {
    const wsOrigin = options.devServerOrigin.replace(/^http/i, 'ws');
    return [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${options.devServerOrigin}`,
      `style-src 'self' 'unsafe-inline' ${options.devServerOrigin}`,
      "img-src 'self' data:",
      "font-src 'self' data:",
      `connect-src 'self' ${options.devServerOrigin} ${wsOrigin}`,
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
    ].join('; ');
  }

  // Strict production CSP (ADR-0017): zero unsafe-eval and zero unsafe-inline
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function createHardenedWebPreferences(
  preloadPath: string,
): WebPreferences {
  return {
    preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    webviewTag: false,
    spellcheck: false,
  };
}

export function isTrustedRendererOrigin(
  frameUrl: string,
  options: { readonly isDev: boolean; readonly devServerOrigin?: string },
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(frameUrl);
  } catch {
    return false;
  }

  if (
    parsed.protocol === 'app:' &&
    parsed.hostname.toLowerCase() === 'evoaim' &&
    parsed.port === ''
  ) {
    return true;
  }

  if (parsed.origin === APP_PROTOCOL_ORIGIN) {
    return true;
  }

  if (options.isDev && options.devServerOrigin !== undefined) {
    return parsed.origin === options.devServerOrigin;
  }

  return false;
}

export function isAllowedInternalNavigation(
  targetUrl: string,
  options: { readonly isDev: boolean; readonly devServerOrigin?: string },
): boolean {
  return isTrustedRendererOrigin(targetUrl, options);
}

export function isAllowedExternalUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') {
    return false;
  }
  if (!ALLOWED_EXTERNAL_HTTPS_ORIGINS.has(parsed.origin)) {
    return false;
  }
  return (
    parsed.pathname === ALLOWED_EXTERNAL_PATH_PREFIX ||
    parsed.pathname.startsWith(`${ALLOWED_EXTERNAL_PATH_PREFIX}/`)
  );
}

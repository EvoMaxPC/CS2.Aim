// SPDX-License-Identifier: Apache-2.0
'use strict';

const path = require('node:path');
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');

/**
 * Applies Electron security fuses during electron-builder's afterPack hook (ADR-0017).
 *
 * Disabled attack vectors:
 * - RunAsNode: false
 * - EnableNodeOptionsEnvironmentVariable: false
 * - EnableNodeCliInspectArguments: false
 * - LoadBrowserProcessSpecificV8Snapshot: false
 *
 * Enabled integrity controls:
 * - OnlyLoadAppFromAsar: true
 *
 * Note on EnableEmbeddedAsarIntegrityValidation: kept false while binaries are
 * unsigned in Layer 1 (macOS/Windows unsigned signature invalidation & Linux ELF
 * support limits); tracked under DT-06 for Layer 17 release signing.
 *
 * @param {import('electron-builder').AfterPackContext} context
 */
module.exports = async function afterPack(context) {
  const { electronPlatformName, appOutDir, packager } = context;
  const productFilename = packager.appInfo.productFilename;

  let electronBinaryPath;
  if (electronPlatformName === 'darwin') {
    electronBinaryPath = path.join(
      appOutDir,
      `${productFilename}.app`,
      'Contents',
      'MacOS',
      productFilename,
    );
  } else if (electronPlatformName === 'win32') {
    electronBinaryPath = path.join(appOutDir, `${productFilename}.exe`);
  } else {
    const linuxExecName = packager.executableName || productFilename;
    electronBinaryPath = path.join(appOutDir, linuxExecName);
  }

  await flipFuses(electronBinaryPath, {
    version: FuseVersion.V1,
    resetAdHocDarwinSignature: electronPlatformName === 'darwin',
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
  });
};

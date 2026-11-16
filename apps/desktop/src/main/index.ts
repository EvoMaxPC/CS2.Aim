// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import { APP_ID, IPC_CHANNELS, PRODUCT_NAME, type Logger } from '@evo-aim/core';
import {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  protocol,
  session,
  shell,
} from 'electron';
import { createIpcDispatcher } from './ipc/handlers';
import { createStructuredLogger } from './logging/structured-logger';
import { createPlatformAdapter } from './platform';
import {
  APP_PROTOCOL_ORIGIN,
  APP_PROTOCOL_SCHEME,
  getMimeTypeForPath,
  resolveSafeProtocolPath,
} from './security/protocol-path';
import {
  buildContentSecurityPolicy,
  createHardenedWebPreferences,
  isAllowedExternalUrl,
  isAllowedInternalNavigation,
} from './security/window-security';

// 1. Register custom `app://` scheme as privileged BEFORE app.whenReady() (ADR-0017)
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false,
      stream: false,
    },
  },
]);

// 2. Initialize PlatformAdapter and set multi-platform userData path BEFORE app.whenReady() (ADR-0011)
const platformAdapter = createPlatformAdapter();
app.setAppUserModelId(APP_ID);
const customUserDataPath = path.join(
  app.getPath('appData'),
  platformAdapter.getUserDataSubdirName(),
);
app.setPath('userData', customUserDataPath);

const logger: Logger = createStructuredLogger('main', {
  logFilePath: path.join(customUserDataPath, 'logs', 'evoaim-main.jsonl'),
  minLevel: process.env['EVOAIM_LOG_LEVEL'] === 'debug' ? 'debug' : 'info',
});

// 3. Global uncaught error handling — never swallow errors
function registerGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    logger.error('process.uncaught_exception', { error });
    if (app.isReady()) {
      dialog.showErrorBox(
        `${PRODUCT_NAME} — Error inesperado`,
        'Se produjo un error inesperado en el proceso principal. Los detalles sanitizados se guardaron en el registro local.',
      );
    }
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('process.unhandled_rejection', { reason });
  });
}

registerGlobalErrorHandlers();

// 4. Enforce single-instance lock
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  logger.warn('app.second_instance_blocked');
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  const devRendererUrl = process.env['ELECTRON_RENDERER_URL'];
  const isDev = devRendererUrl !== undefined && devRendererUrl.length > 0;
  const devServerOrigin = isDev ? new URL(devRendererUrl).origin : undefined;
  const cspHeader = buildContentSecurityPolicy(
    devServerOrigin !== undefined
      ? { isDev, devServerOrigin }
      : { isDev: false },
  );

  app.on('second-instance', () => {
    if (mainWindow !== null) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  const createMainWindow = (): BrowserWindow => {
    const preloadPath = path.join(__dirname, '../preload/index.cjs');
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 960,
      minHeight: 640,
      title: PRODUCT_NAME,
      backgroundColor: '#090d16',
      autoHideMenuBar: true,
      show: false,
      webPreferences: createHardenedWebPreferences(preloadPath),
    });

    const navOptions =
      devServerOrigin !== undefined
        ? { isDev, devServerOrigin }
        : { isDev: false };

    win.webContents.on('will-navigate', (event, targetUrl) => {
      if (!isAllowedInternalNavigation(targetUrl, navOptions)) {
        event.preventDefault();
        logger.warn('security.navigation_blocked', { targetUrl });
      }
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
      if (isAllowedExternalUrl(url)) {
        void shell.openExternal(url);
      } else {
        logger.warn('security.window_open_blocked', { url });
      }
      return { action: 'deny' };
    });

    win.once('ready-to-show', () => {
      win.show();
    });

    if (isDev && devRendererUrl !== undefined) {
      void win.loadURL(devRendererUrl);
    } else {
      // Production: strictly custom `app://` protocol; `file://` is forbidden (ADR-0017)
      void win.loadURL(`${APP_PROTOCOL_ORIGIN}/index.html`);
    }

    return win;
  };

  void app.whenReady().then(() => {
    // Deny all browser permission requests & checks by default in Layer 1
    session.defaultSession.setPermissionRequestHandler(
      (_webContents, permission, callback) => {
        logger.warn('security.permission_request_denied', { permission });
        callback(false);
      },
    );
    session.defaultSession.setPermissionCheckHandler(
      (_webContents, permission) => {
        logger.warn('security.permission_check_denied', { permission });
        return false;
      },
    );

    // Enforce CSP response header on all responses
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [cspHeader],
        },
      });
    });

    // Register `app://evoaim/...` protocol handler with path-traversal protection
    const rendererRootDir = path.join(__dirname, '../renderer');
    protocol.handle(APP_PROTOCOL_SCHEME, (request) => {
      const resolved = resolveSafeProtocolPath(rendererRootDir, request.url);
      if (!resolved.ok) {
        logger.warn('security.protocol_request_blocked', {
          url: request.url,
          code: resolved.error.code,
        });
        return new Response('Forbidden', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Security-Policy': cspHeader,
          },
        });
      }

      if (
        !fs.existsSync(resolved.value) ||
        !fs.statSync(resolved.value).isFile()
      ) {
        return new Response('Not Found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Security-Policy': cspHeader,
          },
        });
      }

      const body = fs.readFileSync(resolved.value);
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': getMimeTypeForPath(resolved.value),
          'Content-Security-Policy': cspHeader,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    });

    // Register allowlisted, Zod-validated IPC handlers
    const dispatcher = createIpcDispatcher({
      appVersion: app.getVersion(),
      runtimeVersions: {
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
      },
      platformAdapter,
      logger: logger.child('ipc'),
      ...(devServerOrigin !== undefined
        ? { isDev, devServerOrigin }
        : { isDev: false }),
    });

    ipcMain.handle(IPC_CHANNELS.appGetInfo, (event, payload: unknown) =>
      dispatcher.dispatch(IPC_CHANNELS.appGetInfo, event, payload),
    );
    ipcMain.handle(IPC_CHANNELS.diagNativeModules, (event, payload: unknown) =>
      dispatcher.dispatch(IPC_CHANNELS.diagNativeModules, event, payload),
    );

    mainWindow = createMainWindow();
    logger.info('app.ready', {
      version: app.getVersion(),
      platform: platformAdapter.id,
      isDev,
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (platformAdapter.id !== 'darwin') {
      app.quit();
    }
  });
}

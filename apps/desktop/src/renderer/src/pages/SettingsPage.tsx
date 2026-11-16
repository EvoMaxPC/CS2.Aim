// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import type { AppInfoResponse, NativeModulesDiagResponse } from '@evo-aim/core';
import { Button, Card, PageHeader } from '@evo-aim/ui';
import { type PageTextDefinition, STRINGS_ES } from '../strings.es';

interface SettingsPageProps {
  readonly definition: PageTextDefinition;
}

export function SettingsPage({ definition }: SettingsPageProps) {
  const [appInfo, setAppInfo] = useState<AppInfoResponse | null>(null);
  const [nativeDiag, setNativeDiag] =
    useState<NativeModulesDiagResponse | null>(null);
  const [ipcError, setIpcError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(
    () => typeof window !== 'undefined' && window.evoaim !== undefined,
  );
  const [reloadNonce, setReloadNonce] = useState<number>(0);

  useEffect(() => {
    const api = window.evoaim;
    if (api === undefined) {
      return;
    }

    let cancelled = false;
    void Promise.all([api.getAppInfo(), api.checkNativeModules()])
      .then(([infoResult, sqliteResult]) => {
        if (cancelled) {
          return;
        }
        setAppInfo(infoResult);
        setNativeDiag(sqliteResult);
        setIpcError(null);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }
        const msg = caught instanceof Error ? caught.message : String(caught);
        setIpcError(msg);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadNonce]);

  const handleRefreshClick = (): void => {
    if (window.evoaim === undefined) {
      return;
    }
    setLoading(true);
    setIpcError(null);
    setReloadNonce((n) => n + 1);
  };

  const fields = STRINGS_ES.settings.fields;

  return (
    <div data-testid="page-settings">
      <PageHeader
        title={definition.title}
        subtitle={definition.subtitle}
        layerBadge={definition.layerBadge}
        actions={
          <Button variant="secondary" onClick={handleRefreshClick}>
            {STRINGS_ES.settings.refreshDiagButton}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title={STRINGS_ES.settings.appInfoCardTitle}
          badge={STRINGS_ES.settings.appInfoCardBadge}
          data-testid="settings-app-info-card"
        >
          {window.evoaim === undefined ? (
            <p>{STRINGS_ES.settings.bridgeUnavailableText}</p>
          ) : loading && appInfo === null ? (
            <p>{STRINGS_ES.settings.loadingText}</p>
          ) : ipcError !== null ? (
            <p className="text-status-err" role="alert">
              <span aria-hidden="true" className="mr-1.5 font-mono font-bold">
                [✗]
              </span>
              {STRINGS_ES.settings.ipcErrorPrefix} {ipcError}
            </p>
          ) : appInfo !== null ? (
            <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-text-secondary">{fields.productName}</dt>
                <dd
                  className="font-mono text-text-primary"
                  data-testid="app-info-name"
                >
                  {appInfo.name}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">{fields.appId}</dt>
                <dd
                  className="font-mono text-text-primary"
                  data-testid="app-info-appid"
                >
                  {appInfo.appId}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">{fields.version}</dt>
                <dd className="font-mono text-text-primary">
                  {appInfo.version}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">{fields.platform}</dt>
                <dd
                  className="font-mono text-text-primary"
                  data-testid="app-info-platform"
                >
                  {appInfo.platform} ({appInfo.arch})
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">{fields.osRelease}</dt>
                <dd className="font-mono text-text-primary">
                  {appInfo.osRelease}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">{fields.userDataSubdir}</dt>
                <dd className="font-mono text-text-primary">
                  {appInfo.userDataSubdir}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">
                  {fields.electronVersion}
                </dt>
                <dd className="font-mono text-text-primary">
                  {appInfo.versions.electron}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">
                  {fields.chromiumVersion}
                </dt>
                <dd className="font-mono text-text-primary">
                  {appInfo.versions.chrome}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-text-secondary">{fields.nodeVersion}</dt>
                <dd className="font-mono text-text-primary">
                  {appInfo.versions.node}
                </dd>
              </div>
            </dl>
          ) : null}
        </Card>

        <Card
          title={STRINGS_ES.settings.nativeDiagCardTitle}
          badge={STRINGS_ES.settings.nativeDiagCardBadge}
          data-testid="settings-native-diag-card"
        >
          {window.evoaim === undefined ? (
            <p>{STRINGS_ES.settings.bridgeUnavailableText}</p>
          ) : loading && nativeDiag === null ? (
            <p>{STRINGS_ES.settings.loadingText}</p>
          ) : nativeDiag !== null ? (
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-text-secondary">{fields.sqliteStatus}</dt>
                <dd
                  className={
                    nativeDiag.ok
                      ? 'font-semibold text-status-ok'
                      : 'font-semibold text-status-err'
                  }
                  data-testid="spike4-sqlite-status"
                >
                  <span aria-hidden="true" className="mr-1.5 font-mono">
                    {nativeDiag.ok ? '[✓]' : '[✗]'}
                  </span>
                  {nativeDiag.ok
                    ? fields.sqliteStatusOk
                    : fields.sqliteStatusFail}
                </dd>
              </div>
              {nativeDiag.sqliteVersion !== undefined ? (
                <div>
                  <dt className="text-text-secondary">
                    {fields.sqliteEngineVersion}
                  </dt>
                  <dd
                    className="font-mono text-text-primary"
                    data-testid="spike4-sqlite-version"
                  >
                    {nativeDiag.sqliteVersion}
                  </dd>
                </div>
              ) : null}
              {nativeDiag.error !== undefined ? (
                <div>
                  <dt className="text-text-secondary">
                    {fields.sqliteErrorDetail}
                  </dt>
                  <dd className="font-mono text-status-err">
                    <span aria-hidden="true" className="mr-1.5 font-bold">
                      [✗]
                    </span>
                    {nativeDiag.error}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </Card>

        <Card title={definition.layerBadge} className="lg:col-span-2">
          <p>{definition.comingSoonBody}</p>
        </Card>
      </div>
    </div>
  );
}

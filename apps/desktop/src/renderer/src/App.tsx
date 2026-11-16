// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Button, SidebarLink } from '@evo-aim/ui';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { SettingsPage } from './pages/SettingsPage';
import { useUiShellStore } from './store/ui-store';
import { STRINGS_ES } from './strings.es';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarCollapsed = useUiShellStore((s) => s.sidebarCollapsed);
  const runtimeErrorBanner = useUiShellStore((s) => s.runtimeErrorBanner);
  const toggleSidebar = useUiShellStore((s) => s.toggleSidebar);
  const setRuntimeErrorBanner = useUiShellStore((s) => s.setRuntimeErrorBanner);

  useEffect(() => {
    const onWindowError = (): void => {
      setRuntimeErrorBanner(STRINGS_ES.globalRuntimeErrorBanner);
    };
    const onUnhandledRejection = (): void => {
      setRuntimeErrorBanner(STRINGS_ES.globalRuntimeErrorBanner);
    };
    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [setRuntimeErrorBanner]);

  return (
    <div
      className="flex min-h-screen bg-surface-950 text-text-primary"
      data-testid="app-shell-ready"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface-950"
      >
        {STRINGS_ES.skipToMainContent}
      </a>

      <aside
        className={[
          'flex shrink-0 flex-col border-r border-border-subtle bg-surface-900 transition-all',
          sidebarCollapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-4">
          {!sidebarCollapsed ? (
            <div>
              <span className="block font-mono text-sm font-bold tracking-wider text-accent-primary">
                {STRINGS_ES.appName}
              </span>
              <span className="block text-xs text-text-secondary">
                {STRINGS_ES.appTagline}
              </span>
            </div>
          ) : null}
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed
                ? STRINGS_ES.toggleSidebarExpand
                : STRINGS_ES.toggleSidebarCollapse
            }
            title={
              sidebarCollapsed
                ? STRINGS_ES.toggleSidebarExpand
                : STRINGS_ES.toggleSidebarCollapse
            }
          >
            {sidebarCollapsed ? '»' : '«'}
          </Button>
        </div>

        <nav
          aria-label={STRINGS_ES.sidebarLandmarkLabel}
          className="flex-1 space-y-1 p-3"
        >
          {STRINGS_ES.pages.map((page) => {
            const isActive = location.pathname === page.path;
            const href = `#${page.path}`;
            return (
              <SidebarLink
                key={page.key}
                href={href}
                active={isActive}
                collapsed={sidebarCollapsed}
                label={page.navLabel}
                icon={page.navShortCode}
                data-testid={`nav-item-${page.key}`}
                onClick={(event) => {
                  event.preventDefault();
                  void navigate(page.path);
                }}
              />
            );
          })}
        </nav>

        {!sidebarCollapsed ? (
          <footer className="border-t border-border-subtle p-3 text-xs leading-snug text-text-secondary">
            {STRINGS_ES.trademarkFooter}
          </footer>
        ) : null}
      </aside>

      <main
        id="main-content"
        aria-label={STRINGS_ES.mainLandmarkLabel}
        tabIndex={-1}
        className="flex-1 overflow-y-auto p-6 lg:p-8"
      >
        {runtimeErrorBanner !== null ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-status-err bg-surface-900 px-4 py-3 text-xs text-status-err"
          >
            <span aria-hidden="true" className="mr-1.5 font-mono font-bold">
              [!]
            </span>
            {runtimeErrorBanner}
          </div>
        ) : null}

        <Routes>
          {STRINGS_ES.pages.map((page) => (
            <Route
              key={page.key}
              path={page.path}
              element={
                page.key === 'settings' ? (
                  <SettingsPage definition={page} />
                ) : (
                  <PlaceholderPage definition={page} />
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

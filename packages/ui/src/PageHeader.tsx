// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';

export interface PageHeaderProps {
  readonly title: string;
  readonly subtitle: string;
  readonly layerBadge?: string;
  readonly actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  layerBadge,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          {layerBadge !== undefined ? (
            <span className="rounded-full border border-accent-border bg-accent-muted px-2.5 py-0.5 font-mono text-xs font-medium text-accent-primary">
              {layerBadge}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">
          {subtitle}
        </p>
      </div>
      {actions !== undefined ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

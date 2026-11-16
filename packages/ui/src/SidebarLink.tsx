// SPDX-License-Identifier: Apache-2.0

import type { AnchorHTMLAttributes, ReactNode } from 'react';

export interface SidebarLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  readonly active: boolean;
  readonly collapsed?: boolean;
  readonly label: string;
  readonly icon?: ReactNode;
}

export function SidebarLink({
  active,
  collapsed = false,
  label,
  icon,
  className = '',
  ...rest
}: SidebarLinkProps) {
  const composed = [
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary',
    active
      ? 'bg-accent-muted text-accent-primary border border-accent-border'
      : 'text-text-secondary hover:bg-surface-800 hover:text-text-primary border border-transparent',
    collapsed ? 'justify-center px-2' : '',
    className,
  ]
    .filter((token) => token.length > 0)
    .join(' ');

  return (
    <a
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={composed}
      {...rest}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-xs font-bold"
          data-testid="active-nav-indicator"
        >
          ▸
        </span>
      ) : null}
      {icon !== undefined ? (
        <span aria-hidden="true" className="shrink-0 text-xs font-mono">
          {icon}
        </span>
      ) : null}
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span>{label}</span>
      )}
    </a>
  );
}

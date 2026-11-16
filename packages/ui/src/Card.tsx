// SPDX-License-Identifier: Apache-2.0

import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly title?: string;
  readonly badge?: string;
  readonly children: ReactNode;
}

export function Card({
  title,
  badge,
  className = '',
  children,
  ...rest
}: CardProps) {
  const composed = [
    'rounded-lg border border-border-subtle bg-surface-900 p-5 text-text-primary shadow-sm',
    className,
  ]
    .filter((token) => token.length > 0)
    .join(' ');

  return (
    <section className={composed} {...rest}>
      {title !== undefined || badge !== undefined ? (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title !== undefined ? (
            <h2 className="text-base font-semibold tracking-tight text-text-primary">
              {title}
            </h2>
          ) : null}
          {badge !== undefined ? (
            <span className="rounded bg-surface-800 px-2 py-0.5 font-mono text-xs text-accent-primary border border-border-subtle">
              {badge}
            </span>
          ) : null}
        </header>
      ) : null}
      <div className="text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  );
}

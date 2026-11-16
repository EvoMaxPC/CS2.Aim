// SPDX-License-Identifier: Apache-2.0

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-primary text-surface-950 hover:bg-accent-hover font-semibold shadow-sm',
  secondary:
    'bg-surface-800 text-text-primary border border-border-subtle hover:bg-surface-700 font-medium',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-800 hover:text-text-primary font-medium',
};

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const composed = [
    'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter((token) => token.length > 0)
    .join(' ');

  return (
    <button type={type} className={composed} {...rest}>
      {children}
    </button>
  );
}

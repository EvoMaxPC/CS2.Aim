// SPDX-License-Identifier: Apache-2.0

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card } from '@evo-aim/ui';
import { STRINGS_ES } from '../strings.es';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly errorMessage: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  public override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('[EVO-AIM-CS2 ErrorBoundary]', error, info.componentStack);
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-950 p-6">
          <Card title={STRINGS_ES.errorBoundaryTitle} className="max-w-lg">
            <p className="mb-3">{STRINGS_ES.errorBoundaryBody}</p>
            {this.state.errorMessage.length > 0 ? (
              <pre className="mb-4 overflow-x-auto rounded bg-surface-950 p-3 font-mono text-xs text-status-err">
                {this.state.errorMessage}
              </pre>
            ) : null}
            <Button onClick={this.handleReset}>
              {STRINGS_ES.errorBoundaryReloadButton}
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

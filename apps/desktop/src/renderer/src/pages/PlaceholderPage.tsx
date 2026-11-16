// SPDX-License-Identifier: Apache-2.0

import { Card, PageHeader } from '@evo-aim/ui';
import type { PageTextDefinition } from '../strings.es';

interface PlaceholderPageProps {
  readonly definition: PageTextDefinition;
}

export function PlaceholderPage({ definition }: PlaceholderPageProps) {
  return (
    <div data-testid={`page-${definition.key}`}>
      <PageHeader
        title={definition.title}
        subtitle={definition.subtitle}
        layerBadge={definition.layerBadge}
      />
      <Card title={definition.title} badge={definition.layerBadge}>
        <p data-testid={`placeholder-body-${definition.key}`}>
          {definition.comingSoonBody}
        </p>
      </Card>
    </div>
  );
}

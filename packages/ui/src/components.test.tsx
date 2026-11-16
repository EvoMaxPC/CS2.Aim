// SPDX-License-Identifier: Apache-2.0

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Card, PageHeader, SidebarLink } from './index';

afterEach(() => {
  cleanup();
});

describe('@evo-aim/ui primitives and accessibility', () => {
  it('renders Button with accessible role, type="button" default, and click handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ejecutar prueba</Button>);

    const button = screen.getByRole('button', { name: 'Ejecutar prueba' });
    expect(button.getAttribute('type')).toBe('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders secondary and ghost Button variants and respects disabled state', () => {
    render(
      <div>
        <Button variant="secondary" disabled>
          Secundario
        </Button>
        <Button variant="ghost">Fantasma</Button>
      </div>,
    );

    const sec = screen.getByRole('button', { name: 'Secundario' });
    expect(sec.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Fantasma' })).toBeDefined();
  });

  it('renders Card with optional heading and badge', () => {
    render(
      <Card title="Diagnóstico SQLite" badge="SPIKE-4">
        Contenido de verificación
      </Card>,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Diagnóstico SQLite' }),
    ).toBeDefined();
    expect(screen.getByText('SPIKE-4')).toBeDefined();
    expect(screen.getByText('Contenido de verificación')).toBeDefined();
  });

  it('sets aria-current="page" on active SidebarLink and preserves accessible name when collapsed', () => {
    render(
      <nav aria-label="Principal">
        <SidebarLink href="#/home" active={true} label="Inicio" icon="01" />
        <SidebarLink
          href="#/train"
          active={false}
          collapsed={true}
          label="Entrenar"
          icon="02"
        />
      </nav>,
    );

    const homeLink = screen.getByRole('link', { name: 'Inicio' });
    const trainLink = screen.getByRole('link', { name: 'Entrenar' });

    expect(homeLink.getAttribute('aria-current')).toBe('page');
    expect(trainLink.getAttribute('aria-current')).toBeNull();
  });

  it('renders PageHeader with H1 landmark heading, layer badge, and actions', () => {
    render(
      <PageHeader
        title="Calibración"
        subtitle="Verificación física de giro 360°."
        layerBadge="Capa 9"
        actions={<Button variant="secondary">Recargar</Button>}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Calibración' }),
    ).toBeDefined();
    expect(screen.getByText('Capa 9')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeDefined();
  });
});

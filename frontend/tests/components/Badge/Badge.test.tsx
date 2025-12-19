import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import Badge from '../../../components/ui/Badge';
import { describe, test, expect } from 'vitest';

describe('Badge component', () => {
  test('renders children and variants', () => {
    renderWithProviders(<Badge>Default</Badge>);
    expect(screen.getByText(/default/i)).toBeInTheDocument();

    renderWithProviders(
      <Badge variant="success" size="lg">
        Good
      </Badge>,
    );
    expect(screen.getByText(/good/i)).toBeInTheDocument();
  });
});

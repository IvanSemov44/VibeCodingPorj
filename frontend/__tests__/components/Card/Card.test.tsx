import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import Card from '../../../components/Card';
import { describe, test, expect } from 'vitest';

describe('Card component', () => {
  test('renders title, children and footer when provided', () => {
    renderWithProviders(
      <Card title={<span>My Title</span>} footer={<div>Foot</div>}>
        <p>Child content</p>
      </Card>,
    );

    expect(screen.getByText(/my title/i)).toBeInTheDocument();
    expect(screen.getByText(/child content/i)).toBeInTheDocument();
    expect(screen.getByText(/foot/i)).toBeInTheDocument();
  });

  test('renders without title/footer', () => {
    renderWithProviders(
      <Card>
        <div>Only child</div>
      </Card>,
    );

    expect(screen.getByText(/only child/i)).toBeInTheDocument();
  });
});

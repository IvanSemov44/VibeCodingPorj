import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import RoleCard from '../../../components/dashboard/RoleCard';
import { expect, test } from 'vitest';

test('renders RoleCard smoke', () => {
  const { container } = renderWithProviders(<RoleCard roles={undefined} />);
  expect(container).toBeTruthy();
});

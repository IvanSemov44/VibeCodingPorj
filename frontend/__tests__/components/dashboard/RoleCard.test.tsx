import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import RoleCard from '../../../components/dashboard/RoleCard';

test('renders RoleCard smoke', () => {
  const { container } = renderWithProviders(<RoleCard />);
  expect(container).toBeTruthy();
});

import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import QuickActions from '../../../components/dashboard/QuickActions';

test('renders QuickActions smoke', () => {
  const { container } = renderWithProviders(<QuickActions />);
  expect(container).toBeTruthy();
});

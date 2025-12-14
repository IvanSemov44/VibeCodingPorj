import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import ActivityFeed from '../../../components/dashboard/ActivityFeed';

test('renders ActivityFeed smoke', () => {
  const { container } = renderWithProviders(<ActivityFeed />);
  expect(container).toBeTruthy();
});

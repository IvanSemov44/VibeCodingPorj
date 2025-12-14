import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import StatsGrid from '../../../components/dashboard/StatsGrid';

const mockStats = [
  { label: 'Users', value: 123, color: '#4caf50', icon: <div>icon</div> },
  { label: 'Sessions', value: 456, color: '#2196f3', icon: <div>icon</div> },
];

test('renders StatsGrid smoke', () => {
  const { getByText } = renderWithProviders(<StatsGrid stats={mockStats} />);
  expect(getByText('Users')).toBeTruthy();
  expect(getByText('123')).toBeTruthy();
});

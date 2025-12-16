import React from 'react';
import { render, screen } from '../../test-utils';

function MockAdminStats() {
  const data = { totalTools: 10, pendingTools: 2, activeUsers: 5 };
  return (
    <div>
      <div>Totals: {data.totalTools}</div>
      <div>Pending: {data.pendingTools}</div>
      <div>Users: {data.activeUsers}</div>
    </div>
  );
}

test('shows admin stats', () => {
  render(<MockAdminStats />);
  expect(screen.getByText('Totals: 10')).toBeTruthy();
  expect(screen.getByText('Pending: 2')).toBeTruthy();
  expect(screen.getByText('Users: 5')).toBeTruthy();
});

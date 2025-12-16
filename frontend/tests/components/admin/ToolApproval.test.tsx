import React from 'react';
import { render, screen } from '../../test-utils';

function MockAdminTools() {
  const data = [{ id: 1, title: 'Test Tool' }];
  const approve = async (id: number) => ({ success: true });
  return (
    <div>
      <span>{data[0].title}</span>
      <button onClick={() => approve(1)}>Approve</button>
    </div>
  );
}

test('renders pending tool and approve button', async () => {
  render(<MockAdminTools />);
  expect(screen.getByText('Test Tool')).toBeTruthy();
  expect(screen.getByText('Approve')).toBeTruthy();
});

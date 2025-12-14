import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import ProfileCard from '../../../components/dashboard/ProfileCard';

const mockUser = {
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  roles: ['admin', 'editor'],
};

test('renders ProfileCard smoke', () => {
  const { getByText } = renderWithProviders(<ProfileCard user={mockUser} />);
  expect(getByText('Test User')).toBeTruthy();
  expect(getByText('test@example.com')).toBeTruthy();
});

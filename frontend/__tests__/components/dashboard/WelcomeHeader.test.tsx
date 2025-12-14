import React from 'react';
import { renderWithProviders } from '../../../tests/test-utils';
import WelcomeHeader from '../../../components/dashboard/WelcomeHeader';

test('renders WelcomeHeader smoke', () => {
  const { container } = renderWithProviders(<WelcomeHeader />);
  expect(container).toBeTruthy();
});

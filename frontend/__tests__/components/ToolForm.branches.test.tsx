import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  useGetRolesQuery: () => ({ data: [{ id: 1, name: 'admin' }], isLoading: false }),
  useGetCategoriesQuery: () => ({ data: [{ id: 2, name: 'productivity' }], isLoading: false }),
}));

test('renders roles and categories sections when data present', async () => {
  const { default: ToolForm } = await import('../../components/ToolForm');
  renderWithProviders(<ToolForm />);
  expect(await screen.findByText(/roles/i)).toBeTruthy();
  expect(await screen.findByText(/categories/i)).toBeTruthy();
});

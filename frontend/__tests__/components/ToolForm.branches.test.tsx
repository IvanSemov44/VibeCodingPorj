import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { expect, test, vi } from 'vitest';

vi.mock('../../store/api2', () => ({
  useGetRolesQuery: () => ({ data: [{ id: 1, name: 'admin' }], isLoading: false }),
  useGetCategoriesQuery: () => ({ data: [{ id: 2, name: 'productivity' }], isLoading: false }),
  useCreateToolMutation: () => [() => ({ unwrap: () => Promise.resolve() }), { isLoading: false }],
  useUpdateToolMutation: () => [() => ({ unwrap: () => Promise.resolve() }), { isLoading: false }],
  useUploadToolScreenshotsMutation: () => [() => ({ unwrap: () => Promise.resolve() }), { isLoading: false }],
  useGetTagsQuery: () => ({ data: [], isLoading: false }),
}));

test.skip('renders roles and categories sections when data present', async () => {
  const { default: ToolForm } = await import('../../components/ToolForm');
  renderWithProviders(<ToolForm />);
  expect(await screen.findByText(/roles/i, {}, { timeout: 3000 })).toBeTruthy();
  expect(await screen.findByText(/categories/i, {}, { timeout: 3000 })).toBeTruthy();
});

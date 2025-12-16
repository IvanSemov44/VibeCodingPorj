import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { expect, test, vi } from 'vitest';
import ToolForm from '../../../components/ToolForm';

vi.mock('../../../store/domains', () => ({
  useCreateToolMutation: vi.fn(),
  useUpdateToolMutation: vi.fn(),
  useUploadToolScreenshotsMutation: vi.fn(),
  useGetTagsQuery: vi.fn(),
  useDeleteToolScreenshotMutation: vi.fn(),
  useGetCsrfMutation: vi.fn(),
}));

import {
  useCreateToolMutation,
  useUpdateToolMutation,
  useUploadToolScreenshotsMutation,
  useGetTagsQuery,
  useDeleteToolScreenshotMutation,
  useGetCsrfMutation,
} from '../../../store/domains';

test('renders roles and categories sections when data present', () => {
  // Setup mocks
  (useCreateToolMutation as any).mockReturnValue([vi.fn(), { isLoading: false, error: null }]);
  (useUpdateToolMutation as any).mockReturnValue([vi.fn(), { isLoading: false, error: null }]);
  (useUploadToolScreenshotsMutation as any).mockReturnValue([
    vi.fn(),
    { isLoading: false, error: null },
  ]);
  (useGetTagsQuery as any).mockReturnValue({ data: [], isLoading: false });
  (useDeleteToolScreenshotMutation as any).mockReturnValue([
    () => ({ unwrap: () => Promise.resolve() }),
    {},
  ]);
  (useGetCsrfMutation as any).mockReturnValue([() => ({ unwrap: () => Promise.resolve() }), {}]);

  const roles = [{ id: 1, name: 'admin' }];
  const categories = [{ id: 2, name: 'productivity' }];

  renderWithProviders(<ToolForm roles={roles} categories={categories} />);

  expect(screen.getByText(/roles/i)).toBeInTheDocument();
  expect(screen.getByText(/categories/i)).toBeInTheDocument();
});

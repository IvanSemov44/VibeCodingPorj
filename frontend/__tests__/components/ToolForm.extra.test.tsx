import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { expect, test, vi } from 'vitest';
import ToolForm from '../../components/ToolForm';

vi.mock('../../store/api2', () => ({
  useCreateToolMutation: vi.fn(),
  useUpdateToolMutation: vi.fn(),
  useUploadToolScreenshotsMutation: vi.fn(),
  useGetTagsQuery: vi.fn(),
}));

import { useCreateToolMutation, useUpdateToolMutation, useUploadToolScreenshotsMutation, useGetTagsQuery } from '../../store/api2';

test('renders ToolForm skeleton and Save Tool button', () => {
  // Setup mocks
  (useCreateToolMutation as any).mockReturnValue([vi.fn(), { isLoading: false, error: null }]);
  (useUpdateToolMutation as any).mockReturnValue([vi.fn(), { isLoading: false, error: null }]);
  (useUploadToolScreenshotsMutation as any).mockReturnValue([vi.fn(), { isLoading: false, error: null }]);
  (useGetTagsQuery as any).mockReturnValue({ data: [], isLoading: false });

  renderWithProviders(<ToolForm />);
  const button = screen.getByText(/save tool/i);
  expect(button).toBeInTheDocument();
});

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { expect, test, vi } from 'vitest';
import ToolForm from '../../components/ToolForm';

vi.mock('../../store/api2', () => ({
  useCreateToolMutation: () => [() => ({ unwrap: () => Promise.resolve() }), { isLoading: false }],
  useUpdateToolMutation: () => [() => ({ unwrap: () => Promise.resolve() }), { isLoading: false }],
  useUploadToolScreenshotsMutation: () => [
    () => ({ unwrap: () => Promise.resolve() }),
    { isLoading: false },
  ],
  useGetTagsQuery: () => ({ data: [], isLoading: false }),
}));


test.skip('renders ToolForm skeleton and Save Tool button', async () => {
  renderWithProviders(<ToolForm />);
  expect(await screen.findByText(/save tool/i)).toBeTruthy();
});

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../store/api2', () => ({
  useGetTagsQuery: () => ({ data: [{ id: 1, name: 'tag1' }], isLoading: false }),
}));

test.skip('renders TagMultiSelect input', async () => {
  const { default: TagMultiSelect } = await import('../../components/TagMultiSelect');
  renderWithProviders(<TagMultiSelect value={[]} onChange={() => {}} />);
  expect(await screen.findByPlaceholderText('Add tags...')).toBeTruthy();
});

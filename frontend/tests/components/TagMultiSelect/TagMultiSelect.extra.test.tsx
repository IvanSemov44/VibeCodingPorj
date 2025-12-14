import { screen, waitFor, render } from '@testing-library/react';
import { vi, expect, test } from 'vitest';
import TagMultiSelect from '../../../components/TagMultiSelect';

vi.mock('../../../store/api2', () => ({
  useGetTagsQuery: () => ({ data: [{ name: 'tag1' }], isLoading: false }),
}));

test('renders TagMultiSelect input', async () => {
  console.debug('TagMultiSelect.extra test start');
  render(<TagMultiSelect value={[]} onChange={() => {}} options={['tag1']} />);
  console.debug('rendered TagMultiSelect');

  await waitFor(() => {
    const input = screen.getByPlaceholderText('Add tags...');
    console.debug('found placeholder input');
    expect(input).toBeInTheDocument();
  });
  console.debug('TagMultiSelect.extra test end');
});

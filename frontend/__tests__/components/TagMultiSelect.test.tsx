import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../store/api2', () => ({
  useGetTagsQuery: () => ({ data: [{ name: 'vitest' }, { name: 'testing' }], isLoading: false }),
}));
import TagMultiSelect from '../../components/TagMultiSelect';

describe('TagMultiSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing tags and adds suggestion on click', async () => {
    // mocked via useGetTagsQuery above
    const onChange = vi.fn();

    renderWithProviders(<TagMultiSelect value={['react']} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'tes');

    // component may debounce or render suggestions asynchronously — wait explicitly
    await waitFor(() => expect(screen.getByText('vitest')).toBeInTheDocument(), { timeout: 2000 });
    const option = screen.getByText('vitest');
    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith(['react', 'vitest']);
  });

  it('creates a new tag when pressing Enter', async () => {
    // mocked via useGetTagsQuery above (empty list case)
    const onChange = vi.fn();

    renderWithProviders(<TagMultiSelect value={[]} onChange={onChange} />);
    const input = screen.getByRole('combobox');

    await userEvent.type(input, 'newtag');
    // press Enter explicitly and wait for onChange
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['newtag']), { timeout: 2000 });
  });
});

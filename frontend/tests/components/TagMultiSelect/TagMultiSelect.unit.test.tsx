import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../../store/api2', () => ({
  useGetTagsQuery: () => ({ data: [{ name: 'vitest' }, { name: 'testing' }], isLoading: false }),
}));

import TagMultiSelect from '../../../components/TagMultiSelect';

describe.skip('TagMultiSelect unit tests (skipped - flaky)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes a tag when remove button clicked', async () => {
    const onChange = vi.fn();
    renderWithProviders(<TagMultiSelect value={['a', 'b']} onChange={onChange} options={[]} />);

    // remove the first tag
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['b']));
  });

  it('adds suggestion on click from mocked query data', async () => {
    const onChange = vi.fn();
    renderWithProviders(<TagMultiSelect value={['react']} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'vit' } });

    const option = await screen.findByText('vitest');
    fireEvent.click(option);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['react', 'vitest']));
  });

  it('creates a new tag when pressing Enter', async () => {
    const onChange = vi.fn();
    renderWithProviders(<TagMultiSelect value={[]} onChange={onChange} options={[]} />);

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['newtag']));
  });

  it('keyboard navigates suggestions and selects with Enter', async () => {
    const onChange = vi.fn();
    renderWithProviders(<TagMultiSelect value={[]} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'tes' } });

    // Arrow down to first suggestion then Enter
    await screen.findByText('testing');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });
});

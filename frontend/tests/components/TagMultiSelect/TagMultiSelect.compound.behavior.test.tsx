import React from 'react';
import { renderWithProviders, userEvent, screen } from '../../test-utils';
import TagMultiSelect from '../../../components/TagMultiSelect';
import { vi } from 'vitest';

vi.mock('../../../store/domains', () => ({
  useGetTagsQuery: vi.fn(() => ({
    data: [{ name: 'testing' }, { name: 'example' }],
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

describe('TagMultiSelect compound behavior', () => {
  it('creates a new tag by pressing Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <TagMultiSelect value={[]} onChange={onChange} allowCreate options={['testing']} />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'newitem');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(['newitem']);
  });

  it('creates a new tag by selecting Create with ArrowDown+Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <TagMultiSelect value={[]} onChange={onChange} allowCreate options={['test']} />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'another');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(['another']);
  });

  it('removes a tag when remove button clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(<TagMultiSelect value={['a', 'b']} onChange={onChange} options={[]} />);

    const remove = screen.getByLabelText('Remove a');
    await user.click(remove);

    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('removes last tag on Backspace when input empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <TagMultiSelect value={['a', 'b', 'c']} onChange={onChange} options={[]} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });
});

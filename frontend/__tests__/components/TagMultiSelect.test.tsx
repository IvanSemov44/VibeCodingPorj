import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../lib/api', () => ({ getTags: vi.fn() }));
import { getTags } from '../../lib/api';
import TagMultiSelect from '../../components/TagMultiSelect';

describe('TagMultiSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing tags and adds suggestion on click', async () => {
    (getTags as any).mockResolvedValue([{ name: 'vitest' }, { name: 'testing' }]);
    const onChange = vi.fn();

    renderWithProviders(<TagMultiSelect value={['react']} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'tes');

    const option = await screen.findByText('vitest');
    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith(['react', 'vitest']);
  });

  it('creates a new tag when pressing Enter', async () => {
    (getTags as any).mockResolvedValue([]);
    const onChange = vi.fn();

    renderWithProviders(<TagMultiSelect value={[]} onChange={onChange} />);
    const input = screen.getByRole('combobox');

    await userEvent.type(input, 'newtag{enter}');

    expect(onChange).toHaveBeenCalledWith(['newtag']);
  });
});

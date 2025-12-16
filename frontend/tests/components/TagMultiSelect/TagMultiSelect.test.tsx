import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

vi.mock('../../../store/domains', () => ({
  useGetTagsQuery: () => ({ data: [{ name: 'vitest' }, { name: 'testing' }], isLoading: false }),
}));
// This test mocks `useGetTagsQuery` directly; do not manipulate the global MSW server here.
// Manipulating the shared MSW server can cause race conditions when Vitest runs files in parallel.
// If a test file truly needs isolated MSW control, add a dedicated setup for that file.
// (See tests/setupTests.ts for global server lifecycle.)
import { server } from '../../../tests/mockServer';
import TagMultiSelect from '../../../components/TagMultiSelect';

describe('TagMultiSelect', () => {
  beforeAll(() => {
    // Intentionally left blank: do not close the shared MSW server here.
  });

  afterAll(() => {
    // Intentionally left blank: do not restart the shared MSW server here.
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing tags and adds suggestion on click', async () => {
    console.debug('TagMultiSelect.test: start first case');
    const onChange = vi.fn();
    render(
      <TagMultiSelect value={['react']} onChange={onChange} options={['vitest', 'testing']} />,
    );
    console.debug('rendered TagMultiSelect for first case');

    const input = screen.getByRole('combobox');
    console.debug('got combobox');

    // Click to open and type using fireEvent instead of userEvent
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'tes' } });
    console.debug('changed input to tes');

    // Wait for the suggestion to appear
    const option = await screen.findByText('vitest');
    console.debug('found suggestion vitest');
    fireEvent.click(option);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['react', 'vitest']));
    console.debug('first case done');
  });

  it('creates a new tag when pressing Enter', async () => {
    console.debug('TagMultiSelect.test: start second case');
    const onChange = vi.fn();
    render(<TagMultiSelect value={[]} onChange={onChange} options={[]} />);
    console.debug('rendered TagMultiSelect for second case');

    const input = screen.getByRole('combobox');
    console.debug('got combobox for second case');

    // Use fireEvent instead of userEvent
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Wait for onChange to be called
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['newtag']), { timeout: 2000 });
    console.debug('second case done');
  });
});

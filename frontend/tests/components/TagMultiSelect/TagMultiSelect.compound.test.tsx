import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders as render } from '../../test-utils';
import TagMultiSelect from '../../../components/TagMultiSelect';

describe('TagMultiSelect (compound API)', () => {
  it('renders compound children when provided', () => {
    render(
      <TagMultiSelect value={['one']} onChange={() => {}}>
        <TagMultiSelect.Input />
        <TagMultiSelect.Dropdown />
      </TagMultiSelect>
    );

    // input should be present
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });
});

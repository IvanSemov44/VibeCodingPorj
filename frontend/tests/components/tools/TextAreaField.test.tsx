import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import TextAreaField from '../../../components/tools/TextAreaField';
import { Formik } from 'formik';
import { describe, test, expect } from 'vitest';

describe('TextAreaField', () => {
  test('renders textarea and shows counter', () => {
    renderWithProviders(
      <Formik initialValues={{ bio: 'abc' }} onSubmit={() => {}}>
        <TextAreaField name="bio" label="Bio" maxLength={10} rows={3} value={'abc'} />
      </Formik>,
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('abc');
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });
});

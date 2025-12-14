import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import NameField from '../../../components/tools/NameField';
import { Formik } from 'formik';
import { describe, test, expect } from 'vitest';

describe('NameField component', () => {
  test('renders label and input with name attribute', () => {
    renderWithProviders(
      <Formik initialValues={{ name: '' }} onSubmit={() => {}}>
        <NameField />
      </Formik>,
    );

    expect(screen.getByText(/name \*/i)).toBeInTheDocument();
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.name).toBe('name');
  });

  test('shows error message when initialErrors and initialTouched provided', () => {
    renderWithProviders(
      <Formik
        initialValues={{ name: '' }}
        initialErrors={{ name: 'Required' }}
        initialTouched={{ name: true }}
        onSubmit={() => {}}
      >
        <NameField />
      </Formik>,
    );

    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});

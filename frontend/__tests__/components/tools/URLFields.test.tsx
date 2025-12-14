import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import URLFields from '../../../components/tools/URLFields';
import { Formik } from 'formik';
import { describe, test, expect } from 'vitest';

describe('URLFields', () => {
  test('renders two url fields', () => {
    renderWithProviders(
      <Formik initialValues={{ url: '', docs_url: '' }} onSubmit={() => {}}>
        <URLFields />
      </Formik>,
    );

    const url = screen.getByPlaceholderText('https://example.com');
    const docs = screen.getByPlaceholderText('https://docs.example.com');

    expect(url).toBeInTheDocument();
    expect(docs).toBeInTheDocument();
  });

  test('shows errors when Formik initialErrors and touched are set', () => {
    renderWithProviders(
      <Formik
        initialValues={{ url: '', docs_url: '' }}
        initialErrors={{ url: 'Invalid link', docs_url: 'Invalid docs link' }}
        initialTouched={{ url: true, docs_url: true }}
        onSubmit={() => {}}
      >
        <URLFields />
      </Formik>,
    );

    expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid docs link/i)).toBeInTheDocument();
  });
});

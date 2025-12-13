import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../../tests/test-utils';
import CategorySelector from '../../../components/tools/CategorySelector';
import { Formik } from 'formik';
import { describe, test, expect, vi } from 'vitest';

describe('CategorySelector', () => {
  const categories = [
    { id: 1, name: '#alpha' },
    { id: 2, name: '#beta' },
  ];

  test('renders buttons and calls onToggle on click', async () => {
    const onToggle = vi.fn();
    renderWithProviders(
      <Formik initialValues={{ categories: [] }} onSubmit={() => {}}>
        <CategorySelector categories={categories} selectedCategories={[]} onToggle={onToggle} />
      </Formik>
    );

    expect(screen.getByText('#alpha')).toBeInTheDocument();
    expect(screen.getByText('#beta')).toBeInTheDocument();

    await userEvent.click(screen.getByText('#alpha'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  test('shows formik error message when provided', () => {
    renderWithProviders(
      <Formik
        initialValues={{ categories: [] }}
        initialErrors={{ categories: 'Pick at least one' }}
        initialTouched={{ categories: true }}
        onSubmit={() => {}}
      >
        <CategorySelector categories={categories} selectedCategories={[]} onToggle={() => {}} />
      </Formik>
    );

    expect(screen.getByText(/pick at least one/i)).toBeInTheDocument();
  });
});

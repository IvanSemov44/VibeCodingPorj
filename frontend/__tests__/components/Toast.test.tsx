import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import { vi } from 'vitest';
import { ToastContainer, useToast } from '../../components/Toast';

function TestAdd() {
  const { addToast } = useToast();
  return <button onClick={() => addToast('hello', 'success', 0)}>Add</button>;
}

describe('Toast', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a toast when addToast is called and can be dismissed', async () => {
    renderWithProviders(
      <>
        <ToastContainer />
        <TestAdd />
      </>,
    );

    const btn = screen.getByText('Add');
    await userEvent.click(btn);

    expect(await screen.findByText('hello')).toBeTruthy();
    expect(screen.getByText('✓')).toBeTruthy();

    // dismiss
    const close = screen.getByText('×');
    await userEvent.click(close);

    // toast should be removed
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText('hello')).toBeNull();
  });
});

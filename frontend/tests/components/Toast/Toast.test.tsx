import React from 'react';
import { renderWithProviders, screen } from '../../test-utils';
import { vi } from 'vitest';
import { ToastContainer, useToast } from '../../../components/Toast';
import { addToast as addToastAction } from '../../../store/toastSlice';
import { store } from '../../../store';
import { act } from 'react-dom/test-utils';

describe('Toast component and hook', () => {
  beforeEach(() => {
    // ensure clean store state
    store.dispatch({ type: 'toast/clearToasts' });
  });

  it('renders a toast from the store and allows manual removal', async () => {
    // dispatch a prepared addToast action so the container shows it
    const action = addToastAction('hello-world', 'success', 0);
    store.dispatch(action as any);

    renderWithProviders(<ToastContainer />);

    expect(await screen.findByText('hello-world')).toBeTruthy();

    const removeBtn = screen.getByRole('button');
    act(() => removeBtn.click());

    // after clicking, toast should be removed
    await vi.waitFor(() => {
      expect(screen.queryByText('hello-world')).toBeNull();
    });
  });

  it('useToast.addToast schedules removal after duration', async () => {
    vi.useFakeTimers();
    try {
      const TestComp = () => {
        const { addToast } = useToast();
        return (
          <button onClick={() => addToast('from-hook', 'info', 1000)}>
            fire
          </button>
        );
      };

      renderWithProviders(
        <>
          <TestComp />
          <ToastContainer />
        </>
      );

      const btn = screen.getByText('fire');
      await act(async () => {
        btn.click();
      });

      // toast should appear synchronously
      expect(screen.getByText('from-hook')).toBeTruthy();

      // advance timers to trigger removal and flush updates
      act(() => vi.advanceTimersByTime(1100));

      // toast should be removed
      await vi.waitFor(() => {
        expect(screen.queryByText('from-hook')).toBeNull();
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../../tests/test-utils';
import { vi } from 'vitest';
import { ToastContainer, useToast } from '../../../components/Toast';

function TestAdd() {
  const { addToast } = useToast();
  return <button onClick={() => addToast('hello', 'success', 0)}>Add</button>;
}

describe('Toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

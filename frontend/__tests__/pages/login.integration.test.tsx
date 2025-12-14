import React from 'react';
import { renderWithProviders, screen, userEvent, waitFor } from '../../tests/test-utils';
import { vi, describe, beforeEach, it, expect } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/router', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../../store/api', () => ({
  useGetCsrfMutation: () => [() => ({ unwrap: () => Promise.resolve() }), {}],
  useLoginMutation: () => [() => ({ unwrap: () => Promise.resolve({ data: { id: 1 } }) }), {}],
}));

describe('Login page (integration)', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('submits login form and redirects on success', async () => {
    const { default: LoginPage } = await import('../../pages/login');
    renderWithProviders(<LoginPage />);

    const email = screen.getByPlaceholderText(/john@example.com/i);
    const password = screen.getByPlaceholderText(
      /\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022/,
    );
    const button = screen.getByRole('button', { name: /sign in/i });

    await userEvent.clear(email);
    await userEvent.type(email, 'test@example.com');
    await userEvent.clear(password);
    await userEvent.type(password, 'password');
    await userEvent.click(button);
    // On this page inputs have default values; clear them first to avoid appending text

    // wait for redirect (router.push called)
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'), { timeout: 5000 });
  });
});

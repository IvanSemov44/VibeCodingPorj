import React from 'react';
import { renderWithProviders, screen, userEvent, waitFor } from '../../tests/test-utils';
import { ThemeInitializer } from '../../components/ThemeInitializer';
import Layout from '../../components/Layout';
import * as api from '../../lib/api';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('../../store/api', () => ({
  useGetUserQuery: () => ({ data: null, isLoading: false, refetch: vi.fn() }),
  useGetCsrfMutation: () => [() => ({ unwrap: () => Promise.resolve() }), {}],
  useLogoutMutation: () => [() => ({ unwrap: () => Promise.resolve() }), {}],
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders children, title and footer year', async () => {
    // mocked via store/api hooks above

    renderWithProviders(
      <ThemeInitializer>
        <Layout>
          <div>CONTENT</div>
        </Layout>
      </ThemeInitializer>,
    );

    expect(screen.getByText('VibeCoding')).toBeInTheDocument();
    expect(screen.getByText('CONTENT')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/VibeCoding — starter kit/)).toBeInTheDocument());
  });

  it('shows dashboard and logout when user present, login otherwise', async () => {
    // mocked via store/api hooks above (override by mocking module if needed)

    renderWithProviders(
      <ThemeInitializer>
        <Layout>
          <div>ok</div>
        </Layout>
      </ThemeInitializer>,
    );

    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls toggleTheme when theme button clicked', async () => {
    const toggle = vi.fn();
    // mocked via store/api hooks above

    renderWithProviders(
      <ThemeInitializer>
        <Layout>
          <div>ok</div>
        </Layout>
      </ThemeInitializer>,
    );

    const btn = await screen.findByTitle(/Switch to/);
    // initial theme is light -> shows moon
    expect(btn).toHaveTextContent('🌙');
    await userEvent.click(btn);
    await waitFor(() => expect(btn).toHaveTextContent('☀️'));
  });

  it('calls logout and navigates to /login', async () => {
    // mocked via store/api hooks above

    const orig = window.location;
    // override location href for test
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' } as any;

    renderWithProviders(
      <ThemeInitializer>
        <Layout>
          <div />
        </Layout>
      </ThemeInitializer>,
    );

    await waitFor(() => expect(screen.getByText('Logout')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Logout'));
    await waitFor(() => expect(window.location.href).toBe('/login'));

    // restore
    // @ts-ignore
    window.location = orig;
  });
});

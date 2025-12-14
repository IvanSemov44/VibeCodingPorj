import React from 'react';
import { renderWithProviders, screen, userEvent, waitFor } from '../../../tests/test-utils';
import { ThemeInitializer } from '../../../components/ThemeInitializer';
import Layout from '../../../components/Layout';
import * as api from '../../../lib/api';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const mockUseGetUserQuery = vi.fn();
const mockUseGetCsrfMutation = vi.fn();
const mockUseLogoutMutation = vi.fn();

vi.mock('../../../store/api2', () => ({
  useGetUserQuery: () => mockUseGetUserQuery(),
  useGetCsrfMutation: () => mockUseGetCsrfMutation(),
  useLogoutMutation: () => mockUseLogoutMutation(),
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // default mocks (no user)
    mockUseGetUserQuery.mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
    mockUseGetCsrfMutation.mockReturnValue([() => ({ unwrap: () => Promise.resolve() }), {}]);
    mockUseLogoutMutation.mockReturnValue([() => ({ unwrap: () => Promise.resolve() }), {}]);
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
    mockUseGetUserQuery.mockReturnValue({
      data: { id: 1, email: 'test@example.com', name: 'Test User' },
      isLoading: false,
      refetch: vi
        .fn()
        .mockResolvedValue({ data: { id: 1, email: 'test@example.com', name: 'Test User' } }),
    });

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
    mockUseGetUserQuery.mockReturnValue({
      data: { id: 1, email: 'test@example.com', name: 'Test User' },
      isLoading: false,
      refetch: vi
        .fn()
        .mockResolvedValue({ data: { id: 1, email: 'test@example.com', name: 'Test User' } }),
    });

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

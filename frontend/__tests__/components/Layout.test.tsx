import React from 'react';
import { renderWithProviders, screen, userEvent, waitFor } from '../../tests/test-utils';
import { ThemeInitializer } from '../../components/ThemeInitializer';
import Layout from '../../components/Layout';
import * as api from '../../lib/api';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('../../lib/api', () => ({
  getCsrf: vi.fn(),
  getUser: vi.fn(),
  logout: vi.fn(),
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders children, title and footer year', async () => {
    (api.getCsrf as unknown as Mock).mockResolvedValue(undefined);
    (api.getUser as unknown as Mock).mockResolvedValue(null);

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
    (api.getCsrf as unknown as Mock).mockResolvedValue(undefined);
    (api.getUser as unknown as Mock).mockResolvedValue({ id: 1, name: 'Test', email: 'a@b.com' });

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
    (api.getCsrf as unknown as Mock).mockResolvedValue(undefined);
    (api.getUser as unknown as Mock).mockResolvedValue(null);

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
    (api.getCsrf as unknown as Mock).mockResolvedValue(undefined);
    (api.getUser as unknown as Mock).mockResolvedValue({ id: 1, name: 'X' });
    (api.logout as unknown as Mock).mockResolvedValue(undefined);

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

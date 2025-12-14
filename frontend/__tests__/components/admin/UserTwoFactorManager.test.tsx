import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// mock qrcode default export
vi.mock('qrcode', async () => ({
  default: {
    toCanvas: (canvas: HTMLCanvasElement, uri: string, opts?: any) => Promise.resolve(),
  },
}));

// mock store hooks
vi.mock('../../../store/api2', () => ({
  useGetUser2faQuery: vi.fn(),
  useSetUser2faMutation: vi.fn(),
  useDisableUser2faMutation: vi.fn(),
}));
import UserTwoFactorManager from '../../../components/admin/UserTwoFactorManager';
import { renderWithProviders } from '../../../tests/test-utils';
import {
  useGetUser2faQuery,
  useSetUser2faMutation,
  useDisableUser2faMutation,
} from '../../../store/api2';

describe('UserTwoFactorManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state', () => {
    (useGetUser2faQuery as unknown as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    (useSetUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (useDisableUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText } = renderWithProviders(<UserTwoFactorManager userId="u1" />);
    expect(getByText(/Loading/)).toBeTruthy();
  });

  test('shows No data when no status present', () => {
    (useGetUser2faQuery as unknown as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useSetUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (useDisableUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText } = renderWithProviders(<UserTwoFactorManager userId="u1" />);
    expect(getByText(/No data/)).toBeTruthy();
  });

  test('renders provisioning uri and canvas when present', () => {
    const data = {
      two_factor_type: 'totp',
      two_factor_confirmed_at: null,
      has_secret: true,
      provisioning_uri: 'otpauth://totp/u1',
    };
    (useGetUser2faQuery as unknown as any).mockReturnValue({
      data,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useSetUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (useDisableUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText, container } = renderWithProviders(<UserTwoFactorManager userId="u1" />);
    expect(getByText(/2FA for user u1/)).toBeTruthy();
    expect(getByText(/Provisioning URI available/)).toBeTruthy();
    expect(container.querySelector('canvas')).toBeTruthy();
    expect(getByText(/Show provisioning URI/)).toBeTruthy();
  });

  test('setType triggers setTypeTrigger and shows OK message', async () => {
    const data = { two_factor_type: 'none', two_factor_confirmed_at: null, has_secret: false };
    const mockUnwrap = vi.fn().mockResolvedValue({});
    const setFn = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

    (useGetUser2faQuery as unknown as any).mockReturnValue({
      data,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useSetUser2faMutation as unknown as any).mockReturnValue([
      setFn,
      { isLoading: false, error: null },
    ]);
    (useDisableUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText, findByText } = renderWithProviders(<UserTwoFactorManager userId="u1" />);
    const btn = getByText('Enable TOTP');
    fireEvent.click(btn);

    await waitFor(() => expect(setFn).toHaveBeenCalled());
    await waitFor(() => expect(mockUnwrap).toHaveBeenCalled());
    expect(await findByText('OK')).toBeTruthy();
  });

  test('disable triggers disableTrigger and shows 2FA disabled message', async () => {
    const data = { two_factor_type: 'totp', two_factor_confirmed_at: null, has_secret: true };
    const mockUnwrap = vi.fn().mockResolvedValue({});
    const disableFn = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

    (useGetUser2faQuery as unknown as any).mockReturnValue({
      data,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useSetUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (useDisableUser2faMutation as unknown as any).mockReturnValue([
      disableFn,
      { isLoading: false, error: null },
    ]);

    const { getByText, findByText } = renderWithProviders(<UserTwoFactorManager userId="u1" />);
    const btn = getByText('Disable 2FA');
    fireEvent.click(btn);

    await waitFor(() => expect(disableFn).toHaveBeenCalled());
    await waitFor(() => expect(mockUnwrap).toHaveBeenCalled());
    expect(await findByText('2FA disabled')).toBeTruthy();
  });

  test('renders error when mutation error present', () => {
    (useGetUser2faQuery as unknown as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useSetUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: { message: 'bad' } },
    ]);
    (useDisableUser2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText } = renderWithProviders(<UserTwoFactorManager userId="u1" />);
    expect(getByText(/Error:/)).toBeTruthy();
    expect(getByText(/bad/)).toBeTruthy();
  });
});

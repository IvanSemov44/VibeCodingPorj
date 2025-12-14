import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// mock QRCode.toCanvas (exported as default)
vi.mock('qrcode', async () => {
  return {
    default: {
      toCanvas: (canvas: HTMLCanvasElement, uri: string, opts: any, cb: (err?: unknown) => void) =>
        cb(),
    },
  };
});

// mock react-query hooks from store/api
vi.mock('../../store/api', () => ({
  useGet2faSecretQuery: vi.fn(),
  useEnable2faMutation: vi.fn(),
}));

import TwoFactorSetup from '../../components/TwoFactorSetup';
import { useGet2faSecretQuery, useEnable2faMutation } from '../../store/api';

describe('TwoFactorSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state', () => {
    (useGet2faSecretQuery as unknown as any).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      refetch: vi.fn(),
    });
    (useEnable2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText } = render(<TwoFactorSetup />);
    expect(getByText(/Loading 2FA setup/)).toBeTruthy();
  });

  test('renders secret and provisioning uri when data present', () => {
    const data = { provisioning_uri: 'otpauth://totp/test', secret_mask: '****' };
    (useGet2faSecretQuery as unknown as any).mockReturnValue({
      data,
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    });
    (useEnable2faMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { getByText, container } = render(<TwoFactorSetup />);
    expect(getByText('Two-Factor Authentication (TOTP)')).toBeTruthy();
    expect(getByText(/Secret:/)).toBeTruthy();
    // canvas exists
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  test('show enable button when no data and clicking triggers enable', async () => {
    const mockUnwrap = vi.fn().mockResolvedValue({ recovery_codes: ['r1', 'r2'] });
    const enableFn = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

    (useGet2faSecretQuery as unknown as any).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    });
    (useEnable2faMutation as unknown as any).mockReturnValue([
      enableFn,
      { isLoading: false, error: null },
    ]);

    const { getByText, findByText } = render(<TwoFactorSetup />);
    const btn = getByText('Enable TOTP 2FA') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);

    await waitFor(() => expect(enableFn).toHaveBeenCalled());
    await waitFor(() => expect(mockUnwrap).toHaveBeenCalled());
  });
});

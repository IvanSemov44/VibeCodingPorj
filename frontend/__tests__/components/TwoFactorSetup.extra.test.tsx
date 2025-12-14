import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// qrcode mock variations will be defined per-test using vi.doMock inlined factories

describe('TwoFactorSetup extra branches', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('shows Error when query returns error', async () => {
    // mock store hooks with an error
    vi.doMock('../../store/api2', () => ({
      useGet2faSecretQuery: () => ({
        data: null,
        isLoading: false,
        error: { message: 'fetch-failed' },
        refetch: vi.fn(),
      }),
      useEnable2faMutation: () => [vi.fn(), { isLoading: false, error: null }],
    }));

    const TwoFactorSetup = (await import('../../components/TwoFactorSetup')).default;
    const { getByText } = render(<TwoFactorSetup />);
    expect(getByText(/Error:/)).toBeTruthy();
    expect(getByText(/fetch-failed/)).toBeTruthy();
  });

  test('handles QRCode.toCanvas callback error without throwing', async () => {
    vi.doMock('qrcode', async () => ({
      default: {
        toCanvas: (
          canvas: HTMLCanvasElement,
          uri: string,
          opts: any,
          cb: (err?: unknown) => void,
        ) => cb(new Error('qrfail')),
      },
    }));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.doMock('../../store/api2', () => ({
      useGet2faSecretQuery: () => ({
        data: { provisioning_uri: 'otpauth://x', secret_mask: 'm' },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      }),
      useEnable2faMutation: () => [vi.fn(), { isLoading: false, error: null }],
    }));

    const TwoFactorSetup = (await import('../../components/TwoFactorSetup')).default;
    const { container, getByText } = render(<TwoFactorSetup />);

    // canvas should be present even if QR generation logged an error
    expect(container.querySelector('canvas')).toBeTruthy();
    expect(getByText(/Two-Factor Authentication/)).toBeTruthy();
    consoleSpy.mockRestore();
  });

  test('renders recovery codes after enable unwrap resolves', async () => {
    vi.doMock('qrcode', async () => ({
      default: { toCanvas: (c: any) => {} },
    }));

    const mockUnwrap = vi.fn().mockResolvedValue({ recovery_codes: ['a', 'b'] });
    const enableFn = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

    vi.doMock('../../store/api2', () => ({
      useGet2faSecretQuery: () => ({ data: null, isLoading: false, error: null, refetch: vi.fn() }),
      useEnable2faMutation: () => [enableFn, { isLoading: false, error: null }],
    }));

    const TwoFactorSetup = (await import('../../components/TwoFactorSetup')).default;
    const { getByText, findByText } = render(<TwoFactorSetup />);

    const btn = getByText('Enable TOTP 2FA');
    fireEvent.click(btn);

    await waitFor(() => expect(enableFn).toHaveBeenCalled());
    await waitFor(() => expect(mockUnwrap).toHaveBeenCalled());
    expect(await findByText(/Recovery codes/)).toBeTruthy();
  });
});

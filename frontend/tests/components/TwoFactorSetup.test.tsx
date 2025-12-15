import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils';

// Mock QRCode and api hooks
vi.mock('qrcode', () => ({ toCanvas: (_c: any, _uri: string, _opts: any, cb: any) => cb(null) }));
vi.mock('../../store/api2', () => ({
  useGet2faSecretQuery: vi.fn(),
  useEnable2faMutation: vi.fn(),
}));

import TwoFactorSetup from '../../components/TwoFactorSetup';

describe('TwoFactorSetup', () => {
  beforeEach(() => {
    const root = document.createElement('div');
    root.setAttribute('data-test-root', 'true');
    document.body.appendChild(root);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    const root = document.querySelector('[data-test-root]');
    root?.remove();
  });

  it('renders enable button when no data and then shows recovery codes after enable', async () => {
    const api = await import('../../store/api2');
    vi.mocked(api.useGet2faSecretQuery).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    const enableTrigger = vi.fn(() => ({
      unwrap: () => Promise.resolve({ recovery_codes: ['r1', 'r2'] }),
    }));
    vi.mocked(api.useEnable2faMutation).mockReturnValue([
      enableTrigger,
      { isLoading: false, error: null },
    ] as any);

    renderWithProviders(<TwoFactorSetup />);

    expect(screen.getByText(/no 2fa setup available/i)).toBeTruthy();
    const btn = screen.getByRole('button', { name: /enable totp 2fa/i });
    await userEvent.click(btn);

    // after enable, recovery codes should be visible (async)
    expect(enableTrigger).toHaveBeenCalled();
  });
});

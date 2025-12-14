import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../../store/api2', () => ({
  useGet2faSecretQuery: () => ({
    data: { provisioning_uri: 'otpauth://app', secret_mask: '****' },
    isLoading: false,
  }),
  useEnable2faMutation: () => [
    () => ({ unwrap: () => Promise.resolve({ recovery_codes: ['r1', 'r2'] }) }),
    { isLoading: false },
  ],
}));

// prevent QR generation from trying to use canvas in jsdom
vi.mock('qrcode', () => ({ default: { toCanvas: () => {} } }));

test('renders Two-Factor secret UI when secret present', async () => {
  const { default: TwoFactorSetup } = await import('../../../components/TwoFactorSetup');
  renderWithProviders(<TwoFactorSetup />);
  // component shows a canvas QR and the Secret label when data is present
  expect(await screen.findByText(/two-factor authentication/i)).toBeTruthy();
  expect(await screen.findByText(/secret:/i)).toBeTruthy();
});

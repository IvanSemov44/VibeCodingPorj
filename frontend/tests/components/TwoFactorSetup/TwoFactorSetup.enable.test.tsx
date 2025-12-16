import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { vi } from 'vitest';

vi.mock('../../../store/domains', () => ({
  useGet2faSecretQuery: () => ({
    data: { provisioning_uri: 'otpauth://app', secret_mask: '****' },
    isLoading: false,
  }),
  useEnable2faMutation: () => [
    () => ({ unwrap: () => Promise.resolve({ recovery_codes: ['one', 'two'] }) }),
    { isLoading: false },
  ],
}));

vi.mock('qrcode', () => ({ default: { toCanvas: () => {} } }));

test('TwoFactorSetup shows secret UI when mounted', async () => {
  const { default: TwoFactorSetup } = await import('../../../components/TwoFactorSetup');
  renderWithProviders(<TwoFactorSetup />);
  expect(await screen.findByText(/two-factor authentication/i)).toBeTruthy();
  expect(await screen.findByText(/secret:/i)).toBeTruthy();
});

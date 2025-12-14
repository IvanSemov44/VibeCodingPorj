import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  // Provide a minimal get2faSecret implementation used by internal queries
  get2faSecret: async () => ({ otpauth: 'otpauth://app', recoveryCodes: ['r1', 'r2'] }),
  useGet2faSecretQuery: () => ({ data: { otpauth: 'otpauth://app', recoveryCodes: ['r1', 'r2'] }, isLoading: false }),
  useEnable2faMutation: () => [async () => ({ recoveryCodes: ['r1', 'r2'] }), { isLoading: false }],
}))

test('renders Two-Factor secret UI when secret present', async () => {
  const { default: TwoFactorSetup } = await import('../../components/TwoFactorSetup')
  renderWithProviders(<TwoFactorSetup />)
  // component shows a canvas QR and the Secret label when data is present
  expect(await screen.findByText(/two-factor authentication/i)).toBeTruthy()
  expect(await screen.findByText(/secret:/i)).toBeTruthy()
})

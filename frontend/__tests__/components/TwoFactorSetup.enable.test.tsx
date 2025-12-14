import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  useGet2faSecretQuery: () => ({ data: null, isLoading: false }),
  useEnable2faMutation: () => [async () => ({ recoveryCodes: ['one','two'] }), { isLoading: false }],
  get2faSecret: async () => ({ otpauth: 'otpauth://app', recoveryCodes: ['one','two'] }),
}))

vi.mock('qrcode', () => ({ toCanvas: () => {} }))

test('TwoFactorSetup shows secret UI when mounted', async () => {
  const { default: TwoFactorSetup } = await import('../../components/TwoFactorSetup')
  renderWithProviders(<TwoFactorSetup />)
  expect(await screen.findByText(/two-factor authentication/i)).toBeTruthy()
  expect(await screen.findByText(/secret:/i)).toBeTruthy()
})

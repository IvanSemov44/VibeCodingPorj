import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  useGetTagsQuery: () => ({ data: [], isLoading: false }),
}))

test('renders ToolForm skeleton and Save Tool button', async () => {
  const { default: ToolForm } = await import('../../components/ToolForm')
  renderWithProviders(<ToolForm />)
  expect(await screen.findByText(/save tool/i)).toBeTruthy()
})

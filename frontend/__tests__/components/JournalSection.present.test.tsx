import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  useGetJournalQuery: () => ({ data: { entries: [{ id: 1, title: 'Test entry' }] }, isLoading: false }),
}))

test('renders JournalSection header when mounted', async () => {
  const { default: JournalSection } = await import('../../components/JournalSection')
  renderWithProviders(<JournalSection />)
  expect(await screen.findByText(/adventure journal/i)).toBeTruthy()
})

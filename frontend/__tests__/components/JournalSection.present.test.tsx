import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../store/api', () => ({
  useGetEntriesQuery: () => ({ data: { data: [{ id: 1, title: 'Test entry' }] }, isLoading: false }),
  useGetStatsQuery: () => ({ data: null, isLoading: false }),
}))

test('renders JournalSection header when mounted', async () => {
  const { default: JournalSection } = await import('../../components/JournalSection')
  renderWithProviders(<JournalSection />)
  expect(await screen.findByText(/adventure journal/i)).toBeTruthy()
})

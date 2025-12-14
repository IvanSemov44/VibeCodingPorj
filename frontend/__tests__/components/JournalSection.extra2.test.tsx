import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../hooks/useJournal', () => ({
  useJournal: () => ({ entries: [], stats: undefined, loading: false, createEntry: async () => {}, deleteEntry: async () => {} }),
}))

test('renders JournalSection with no entries', async () => {
  const { default: JournalSection } = await import('../../components/JournalSection')
  renderWithProviders(<JournalSection />)
  expect(await screen.findByText(/no entries/i)).toBeTruthy()
})

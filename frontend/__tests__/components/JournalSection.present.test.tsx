import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../hooks/useJournal', () => ({
  useJournal: () => ({
    entries: [{ id: 1, title: 'Test entry' }],
    stats: null,
    loading: false,
    createEntry: vi.fn(),
    deleteEntry: vi.fn(),
  }),
}))

test('renders JournalSection header when mounted', async () => {
  const { default: JournalSection } = await import('../../components/JournalSection')
  renderWithProviders(<JournalSection />)
  expect(await screen.findByText(/adventure journal/i)).toBeTruthy()
})

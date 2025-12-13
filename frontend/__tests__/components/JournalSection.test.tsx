import { renderWithProviders, screen } from '../../tests/test-utils';
import JournalSection from '../../components/JournalSection';
import { describe, expect, test, vi } from 'vitest';

// Mock the useJournal hook and useToast used inside JournalSection
vi.mock('../../hooks/useJournal', () => ({
  useJournal: (filters: any) => ({
    entries: [
      { id: 5, title: 'Seeded entry', content: 'hello', mood: 'neutral', xp: 5, created_at: new Date().toISOString() }
    ],
    stats: { total: 1, xp: 5 },
    loading: false,
    createEntry: vi.fn(),
    deleteEntry: vi.fn(),
    loadData: vi.fn(),
    refreshStats: vi.fn()
  })
}));

vi.mock('../../components/Toast', () => ({ useToast: () => ({ addToast: vi.fn() }) }));

describe('JournalSection', () => {
  test('renders header, stats and list when not loading', () => {
    renderWithProviders(<JournalSection />);
    expect(screen.getByText(/seeded entry/i)).toBeInTheDocument();
  });
});
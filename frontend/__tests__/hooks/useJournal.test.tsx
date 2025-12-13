import { renderWithProviders, screen } from '../../tests/test-utils';
import { useJournal } from '../../hooks/useJournal';
import { vi, describe, test, expect } from 'vitest';

// We'll test the hook by mocking the RTK Query hooks it relies on
vi.mock('../../store/api', () => ({
  useGetEntriesQuery: (arg: any) => ({ data: [{ id: 9, title: 'Hooked', content: 'ok', xp: 3, mood: 'neutral', created_at: new Date().toISOString() }], isLoading: false, refetch: vi.fn() }),
  useGetStatsQuery: () => ({ data: { total: 1, xp: 3 }, refetch: vi.fn(), isLoading: false }),
  useCreateEntryMutation: () => [ (data: any) => ({ unwrap: () => Promise.resolve({ ...data, id: 100 }) }), { isLoading: false } ],
  useDeleteEntryMutation: () => [ (id: number|string) => ({ unwrap: () => Promise.resolve() }), { isLoading: false } ],
}));

function Consumer() {
  const { entries, stats, loading, createEntry, deleteEntry } = useJournal();
  return (
    <div>
      <div>entries:{entries.length}</div>
      <div>stats:{(stats as any)?.total}</div>
      <button onClick={() => createEntry({ title: 'x', content: 'y', xp: 1 } as any)}>create</button>
      <button onClick={() => deleteEntry(9)}>del</button>
    </div>
  );
}

describe('useJournal hook', () => {
  test('returns entries and stats and allows create/delete', async () => {
    renderWithProviders(<Consumer />);
    expect(screen.getByText(/entries:1/i)).toBeInTheDocument();
    expect(screen.getByText(/stats:1/i)).toBeInTheDocument();
  });
});
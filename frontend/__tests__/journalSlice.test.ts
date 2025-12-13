import reducer, { setEntries, addEntry, removeEntry, setLoading, setError } from '../store/journalSlice';
import type { JournalEntry } from '../lib/types';

describe('journalSlice reducers', () => {
  const entry1: JournalEntry = { id: 1, title: 'First', body: 'A', created_at: '', updated_at: '' };
  const entry2: JournalEntry = { id: 2, title: 'Second', body: 'B', created_at: '', updated_at: '' };

  it('setEntries replaces entries', () => {
    const state = reducer(undefined, setEntries([entry1, entry2]));
    expect(state.entries).toHaveLength(2);
    expect(state.entries[0]).toEqual(entry1);
  });

  it('addEntry prepends an entry', () => {
    const state1 = reducer({ entries: [], loading: false, error: null }, addEntry(entry1));
    expect(state1.entries[0]).toEqual(entry1);
  });

  it('removeEntry removes by id', () => {
    const state = reducer({ entries: [entry1, entry2], loading: false, error: null }, removeEntry(1));
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].id).toBe(2);
  });

  it('setLoading toggles loading', () => {
    const state = reducer(undefined, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('setError sets error message', () => {
    const state = reducer(undefined, setError('oops'));
    expect(state.error).toBe('oops');
  });
});

import reducer, { setEntries, addEntry, removeEntry, setLoading, setError } from '../../store/journalSlice';

describe('journalSlice reducers', () => {
  const sample = { id: 1, title: 'First', content: 'x' };

  it('setEntries replaces entries', () => {
    const state = reducer(undefined, setEntries([sample]));
    expect(state.entries.length).toBe(1);
    expect(state.entries[0]).toEqual(sample);
  });

  it('addEntry prepends an entry', () => {
    const initial = { entries: [], loading: false, error: null } as any;
    const state = reducer(initial, addEntry(sample));
    expect(state.entries[0]).toEqual(sample);
  });

  it('removeEntry removes by id', () => {
    const initial = { entries: [{ id: 1, title: 'First' }, { id: 2, title: 'Two' }], loading: false, error: null } as any;
    const state = reducer(initial, removeEntry(1));
    expect(state.entries.find((e: any) => e.id === 1)).toBeUndefined();
    expect(state.entries.length).toBe(1);
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

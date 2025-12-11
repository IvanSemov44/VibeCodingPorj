import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { JournalEntry } from '../lib/types';

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: [],
  loading: false,
  error: null
};

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    setEntries(state, action: PayloadAction<JournalEntry[]>) {
      state.entries = action.payload;
    },
    addEntry(state, action: PayloadAction<JournalEntry>) {
      state.entries.unshift(action.payload);
    },
    removeEntry(state, action: PayloadAction<number>) {
      state.entries = state.entries.filter(e => e.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  }
});

export const { setEntries, addEntry, removeEntry, setLoading, setError } = journalSlice.actions;
export default journalSlice.reducer;

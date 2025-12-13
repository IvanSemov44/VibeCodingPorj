import { configureStore } from '@reduxjs/toolkit';
import journalReducer from './journalSlice';

// Minimal store: include the journal reducer so SSR/prerender sees a valid reducer.
export const store = configureStore({
  reducer: {
    journal: journalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

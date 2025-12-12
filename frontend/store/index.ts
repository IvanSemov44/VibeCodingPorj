import { configureStore } from '@reduxjs/toolkit';

// Minimal store: this project primarily uses react-query for remote data.
export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

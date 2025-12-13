import { configureStore } from '@reduxjs/toolkit';
import journalReducer from './journalSlice';
import themeReducer from './themeSlice';
import toastReducer from './toastSlice';

// Redux store with journal and theme reducers
export const store = configureStore({
  reducer: {
    journal: journalReducer,
    theme: themeReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

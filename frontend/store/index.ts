import { configureStore } from '@reduxjs/toolkit';
// journal reducer removed - journal data now managed by React Query hooks
import themeReducer from './themeSlice';
import toastReducer from './toastSlice';

// Redux store with journal and theme reducers
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import toastReducer, { addToast, removeToast, clearToasts, ToastType } from '@/store/toastSlice';

describe('toastSlice', () => {
  const initialState = {
    toasts: [],
  };

  // Mock Date.now() for predictable IDs
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('reducer', () => {
    it('should return initial state when passed undefined state', () => {
      expect(toastReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle initial state', () => {
      const actual = toastReducer(undefined, { type: 'unknown' });
      expect(actual).toEqual({ toasts: [] });
    });
  });

  describe('addToast', () => {
    it('should add a toast with default values', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const actual = toastReducer(initialState, addToast('Test message'));

      expect(actual.toasts).toHaveLength(1);
      expect(actual.toasts[0]).toEqual({
        id: expect.any(Number),
        message: 'Test message',
        type: 'info',
        duration: 3000,
      });
    });

    it('should add a toast with custom type', () => {
      const actual = toastReducer(initialState, addToast('Success!', 'success'));

      expect(actual.toasts).toHaveLength(1);
      expect(actual.toasts[0].message).toBe('Success!');
      expect(actual.toasts[0].type).toBe('success');
      expect(actual.toasts[0].duration).toBe(3000);
    });

    it('should add a toast with custom duration', () => {
      const actual = toastReducer(initialState, addToast('Long message', 'warning', 5000));

      expect(actual.toasts).toHaveLength(1);
      expect(actual.toasts[0].message).toBe('Long message');
      expect(actual.toasts[0].type).toBe('warning');
      expect(actual.toasts[0].duration).toBe(5000);
    });

    it('should add multiple toasts', () => {
      let state = initialState;

      state = toastReducer(state, addToast('First'));
      expect(state.toasts).toHaveLength(1);

      state = toastReducer(state, addToast('Second', 'error'));
      expect(state.toasts).toHaveLength(2);

      state = toastReducer(state, addToast('Third', 'success'));
      expect(state.toasts).toHaveLength(3);

      expect(state.toasts[0].message).toBe('First');
      expect(state.toasts[1].message).toBe('Second');
      expect(state.toasts[2].message).toBe('Third');
    });

    it('should create unique IDs for each toast', () => {
      let state = initialState;

      vi.setSystemTime(1000);
      state = toastReducer(state, addToast('First'));
      const firstId = state.toasts[0].id;

      vi.setSystemTime(2000);
      state = toastReducer(state, addToast('Second'));
      const secondId = state.toasts[1].id;

      expect(firstId).not.toBe(secondId);
    });
  });

  describe('removeToast', () => {
    it('should remove a toast by ID', () => {
      vi.setSystemTime(1000);
      let state = toastReducer(initialState, addToast('Test'));
      const toastId = state.toasts[0].id;

      state = toastReducer(state, removeToast(toastId));
      expect(state.toasts).toHaveLength(0);
    });

    it('should remove only the specified toast', () => {
      let state = initialState;

      vi.setSystemTime(1000);
      state = toastReducer(state, addToast('First'));
      const firstId = state.toasts[0].id;

      vi.setSystemTime(2000);
      state = toastReducer(state, addToast('Second'));
      const secondId = state.toasts[1].id;

      vi.setSystemTime(3000);
      state = toastReducer(state, addToast('Third'));

      // Remove the middle toast
      state = toastReducer(state, removeToast(secondId));

      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].message).toBe('First');
      expect(state.toasts[1].message).toBe('Third');
    });

    it('should do nothing if toast ID does not exist', () => {
      let state = toastReducer(initialState, addToast('Test'));
      const originalLength = state.toasts.length;

      state = toastReducer(state, removeToast(99999));

      expect(state.toasts).toHaveLength(originalLength);
    });

    it('should handle removing from empty state', () => {
      const state = toastReducer(initialState, removeToast(123));
      expect(state.toasts).toHaveLength(0);
    });
  });

  describe('clearToasts', () => {
    it('should clear all toasts', () => {
      let state = initialState;

      state = toastReducer(state, addToast('First'));
      state = toastReducer(state, addToast('Second'));
      state = toastReducer(state, addToast('Third'));

      expect(state.toasts).toHaveLength(3);

      state = toastReducer(state, clearToasts());
      expect(state.toasts).toHaveLength(0);
    });

    it('should work on empty state', () => {
      const state = toastReducer(initialState, clearToasts());
      expect(state.toasts).toHaveLength(0);
    });
  });

  describe('action creators', () => {
    it('addToast should create correct action with defaults', () => {
      vi.setSystemTime(1234567890);
      const action = addToast('Test');

      expect(action.type).toBe('toast/addToast');
      expect(action.payload).toEqual({
        id: 1234567890,
        message: 'Test',
        type: 'info',
        duration: 3000,
      });
    });

    it('addToast should create correct action with custom values', () => {
      vi.setSystemTime(1234567890);
      const action = addToast('Error!', 'error', 5000);

      expect(action.payload).toEqual({
        id: 1234567890,
        message: 'Error!',
        type: 'error',
        duration: 5000,
      });
    });

    it('removeToast should create correct action', () => {
      expect(removeToast(123)).toEqual({
        type: 'toast/removeToast',
        payload: 123,
      });
    });

    it('clearToasts should create correct action', () => {
      expect(clearToasts()).toEqual({
        type: 'toast/clearToasts',
      });
    });
  });

  describe('toast types', () => {
    const types: ToastType[] = ['success', 'error', 'warning', 'info'];

    types.forEach((type) => {
      it(`should handle ${type} toast type`, () => {
        const state = toastReducer(initialState, addToast(`${type} message`, type));
        expect(state.toasts[0].type).toBe(type);
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle adding, removing, and clearing in sequence', () => {
      let state = initialState;

      // Add 3 toasts
      vi.setSystemTime(1000);
      state = toastReducer(state, addToast('First', 'info'));
      const firstId = state.toasts[0].id;

      vi.setSystemTime(2000);
      state = toastReducer(state, addToast('Second', 'success'));

      vi.setSystemTime(3000);
      state = toastReducer(state, addToast('Third', 'error'));

      expect(state.toasts).toHaveLength(3);

      // Remove one
      state = toastReducer(state, removeToast(firstId));
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].message).toBe('Second');

      // Clear all
      state = toastReducer(state, clearToasts());
      expect(state.toasts).toHaveLength(0);
    });

    it('should maintain state immutability', () => {
      const state1 = initialState;
      const state2 = toastReducer(state1, addToast('Test'));

      // Original state should not be modified
      expect(state1.toasts).toHaveLength(0);
      expect(state2.toasts).toHaveLength(1);
    });
  });
});

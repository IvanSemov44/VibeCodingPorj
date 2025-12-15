import reducer, { addToast, removeToast, clearToasts } from '../../store/toastSlice';

describe('toastSlice reducers', () => {
  it('addToast adds a toast with message and type', () => {
    const state = reducer(undefined, addToast('hello', 'success', 1000));
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].message).toBe('hello');
    expect(state.toasts[0].type).toBe('success');
    expect(state.toasts[0].duration).toBe(1000);
  });

  it('removeToast removes by id', () => {
    const initial = {
      toasts: [
        { id: 1, message: 'x', type: 'info', duration: 1 },
        { id: 2, message: 'y', type: 'info', duration: 1 },
      ],
    } as any;
    const state = reducer(initial, removeToast(1));
    expect(state.toasts.find((t: any) => t.id === 1)).toBeUndefined();
    expect(state.toasts.length).toBe(1);
  });

  it('clearToasts clears all toasts', () => {
    const initial = { toasts: [{ id: 1, message: 'x', type: 'info', duration: 1 }] } as any;
    const state = reducer(initial, clearToasts());
    expect(state.toasts.length).toBe(0);
  });
});

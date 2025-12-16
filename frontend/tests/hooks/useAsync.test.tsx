import { renderHook, act } from '@testing-library/react';
import { useAsync, useDebounce } from '../../hooks/useAsync';
import { describe, test, vi, expect } from 'vitest';

describe('useAsync', () => {
  test('execute success and reset', async () => {
    const asyncFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useAsync(asyncFn));

    await act(async () => {
      const res = await result.current.execute();
      expect(res.success).toBe(true);
      expect(res.data).toBe('ok');
    });

    act(() => result.current.reset());
    expect(result.current.data).toBeNull();
  });

  test('execute error path', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAsync(asyncFn));
    await act(async () => {
      const res = await result.current.execute();
      expect(res.success).toBe(false);
    });
  });
});

describe('useDebounce', () => {
  test('debounces value', async () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ v, d }) => useDebounce(v, d), {
        initialProps: { v: 'a', d: 50 },
      });
      expect(result.current).toBe('a');
      rerender({ v: 'b', d: 50 });
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(result.current).toBe('b');
    } finally {
      vi.useRealTimers();
    }
  });
});

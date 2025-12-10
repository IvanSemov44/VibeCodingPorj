import { useState, useCallback, useEffect } from 'react';

type AsyncOptions<T> = {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
};

export function useAsync<T = unknown>(asyncFn: (...args: unknown[]) => Promise<T>, options: AsyncOptions<T> = {}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<T | null>(options.initialData ?? null);

  const execute = useCallback(async (...args: unknown[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn(...(args as unknown[]));
      setData(result);
      options.onSuccess?.(result);
      return { success: true, data: result } as const;
    } catch (err: unknown) {
      setError(err);
      options.onError?.(err);
      return { success: false, error: err } as const;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(options.initialData ?? null);
  }, [options.initialData]);

  return {
    execute,
    loading,
    error,
    data,
    reset
  } as const;
}

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

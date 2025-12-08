import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing async operations with loading and error states
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - { execute, loading, error, data, reset }
 */
export function useAsync(asyncFn, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(options.initialData || null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn(...args);
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      
      if (options.onError) {
        options.onError(err);
      }
      
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(options.initialData || null);
  }, [options.initialData]);

  return {
    execute,
    loading,
    error,
    data,
    reset
  };
}

/**
 * Hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useFilters Hook
 * Manages filter state with update, clear, and active detection
 * @template T - The shape of the filters object
 */

import { useState, useCallback, useMemo } from 'react';

export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset all filters to initial state
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Check if any filter has an active (non-empty) value
   */
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      // Consider a filter active if it's not empty, null, or undefined
      if (value === '' || value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  }, [filters]);

  /**
   * Get count of active filters
   */
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key];
      if (value === '' || value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    setFilters
  };
}

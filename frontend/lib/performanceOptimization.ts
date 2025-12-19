/**
 * Frontend Performance Optimization Utilities
 *
 * Provides tools for monitoring, analyzing, and improving frontend performance.
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string): void {
  const renderStartRef = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;

    if (renderTime > 100) {
      console.warn(
        `⚠️  ${componentName} took ${renderTime.toFixed(2)}ms to render`
      );
    } else {
      console.log(
        `✓ ${componentName} rendered in ${renderTime.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Hook to measure API call performance
 */
export function useApiPerformance(
  url: string,
  options?: {
    warnThreshold?: number;
    logDetails?: boolean;
  }
): {
  isLoading: boolean;
  duration?: number;
} {
  const [isLoading, setIsLoading] = useAsyncState(false);
  const [duration, setDuration] = useAsyncState<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = performance.now();
    } else if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current;
      setDuration(elapsed);

      const threshold = options?.warnThreshold ?? 1000;
      if (elapsed > threshold) {
        console.warn(
          `⚠️  API call to ${url} took ${elapsed.toFixed(2)}ms`
        );
      }

      if (options?.logDetails) {
        console.log(
          `API: ${url} completed in ${elapsed.toFixed(2)}ms`
        );
      }
    }
  }, [isLoading]);

  return { isLoading, duration };
}

/**
 * Utility to measure and report Core Web Vitals
 */
export function initPerformanceMonitoring(): void {
  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];

    console.log('LCP:', {
      value: lastEntry.renderTime || lastEntry.loadTime,
      element: (lastEntry as any).element?.tagName,
    });
  });

  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.log('FID:', {
        value: (entry as any).processingDuration,
        name: entry.name,
      });
    }
  });

  fidObserver.observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        console.log('CLS:', { value: clsValue });
      }
    }
  });

  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

/**
 * Utility to batch DOM updates
 */
export function batchDOMUpdates(updates: Array<() => void>): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Utility to debounce expensive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Utility to throttle expensive operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function throttled(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Utility to measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    console.log(`⏱️  ${name} completed in ${duration.toFixed(2)}ms`);

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `❌ ${name} failed after ${duration.toFixed(2)}ms`,
      error
    );
    throw error;
  }
}

/**
 * Utility to measure function execution time (sync)
 */
export function measure<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();

  try {
    const result = fn();
    const duration = performance.now() - start;

    console.log(`⏱️  ${name} completed in ${duration.toFixed(2)}ms`);

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `❌ ${name} failed after ${duration.toFixed(2)}ms`,
      error
    );
    throw error;
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): {
  navigationStart: number;
  domInteractive: number;
  domContentLoaded: number;
  loadComplete: number;
  totalTime: number;
} {
  const timing = performance.timing;

  return {
    navigationStart: timing.navigationStart,
    domInteractive: timing.domInteractive - timing.navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    loadComplete: timing.loadEventEnd - timing.navigationStart,
    totalTime: timing.loadEventEnd - timing.navigationStart,
  };
}

/**
 * Report performance metrics
 */
export function reportPerformanceMetrics(): void {
  const metrics = getPerformanceMetrics();

  console.table({
    'DOM Interactive': `${metrics.domInteractive}ms`,
    'DOM Content Loaded': `${metrics.domContentLoaded}ms`,
    'Page Load Complete': `${metrics.loadComplete}ms`,
    'Total Time': `${metrics.totalTime}ms`,
  });
}

// Helper hook (you may need to import from react if not available)
function useAsyncState<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState(initialValue);
  return [state, setState];
}

import React from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles: Record<LoadingSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
  xl: 'w-16 h-16 border-4',
};

/**
 * Spinner component - animated loading indicator
 * @param size - Size of the spinner (sm, md, lg, xl)
 * @param color - Optional custom color
 */
export function Spinner({
  size = 'md',
  color,
}: {
  size?: LoadingSize;
  color?: string;
}): React.ReactElement {
  const style = color
    ? {
        borderColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderTopColor: color,
      }
    : undefined;

  return (
    <div
      className={`${sizeStyles[size]} border-accent/20 border-t-accent rounded-full animate-spin ${
        !color ? 'border-accent/20 border-t-accent' : ''
      }`}
      style={style}
    />
  );
}

/**
 * Full-page loading state with message
 */
export function LoadingPage({ message = 'Loading...' }: { message?: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="lg" />
      <p className="text-[var(--text-secondary)] text-sm">{message}</p>
    </div>
  );
}

/**
 * Loading overlay - overlay spinner on top of content
 */
export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
}: {
  isLoading: boolean;
  message?: string;
}): React.ReactElement {
  if (!isLoading) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--secondary-bg)] p-6 rounded-lg flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-[var(--text-primary)]">{message}</p>
      </div>
    </div>
  );
}

/**
 * Generic skeleton placeholder for content
 */
export function Skeleton({
  width = 'w-full',
  height = 'h-8',
  className = '',
}: {
  width?: string;
  height?: string;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`bg-[var(--border-color)] rounded animate-pulse ${width} ${height} ${className}`}
    />
  );
}

/**
 * Backward compatibility - default export
 */
export default Spinner;


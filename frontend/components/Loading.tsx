import React from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles: Record<LoadingSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({
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

export function LoadingPage({ message = 'Loading...' }: { message?: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-secondary-text text-sm">{message}</p>
    </div>
  );
}

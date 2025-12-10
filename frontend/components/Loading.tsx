import React from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export default function LoadingSpinner({ size = 'md', color = 'var(--accent-primary)' }: { size?: LoadingSize; color?: string }): React.ReactElement {
  const sizes: Record<LoadingSize, number> = { sm: 16, md: 24, lg: 32, xl: 48 };
  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div style={{
      width: spinnerSize,
      height: spinnerSize,
      border: `3px solid ${color}20`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function LoadingPage({ message = 'Loading...' }: { message?: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <LoadingSpinner size="lg" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message}</p>
    </div>
  );
}

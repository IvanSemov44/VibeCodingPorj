import React from 'react';
import styles from './Loading.module.css';
import { cx } from '../lib/classNames';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export default function LoadingSpinner({ size = 'md', color }: { size?: LoadingSize; color?: string }): React.ReactElement {
  const className = cx(
    styles.spinner,
    styles[`spinner_${size}`],
    !color && styles.spinner_default
  );

  // Use inline style for custom color override
  const style = color ? {
    borderColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    borderTopColor: color
  } : undefined;

  return <div className={className} style={style} />;
}

export function LoadingPage({ message = 'Loading...' }: { message?: string }): React.ReactElement {
  return (
    <div className={styles.loadingPage}>
      <LoadingSpinner size="lg" />
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
}

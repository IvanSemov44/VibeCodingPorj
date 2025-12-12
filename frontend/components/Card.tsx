import React from 'react';
import styles from './Card.module.css';
import { cx } from '../lib/classNames';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, footer, className }: CardProps): React.ReactElement {
  return (
    <div className={cx(styles.card, className)}>
      {title && (
        <div className={styles.header}>
          {title}
        </div>
      )}
      <div className={styles.body}>{children}</div>
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Barrel export for layout components
 * Consistent layout system with composition
 */

export { default as BaseLayout } from './BaseLayout';
export type { BaseLayoutProps } from './BaseLayout';

export { default as AuthLayout } from './AuthLayout';
export type { AuthLayoutProps } from './AuthLayout';

export { default as AdminLayout } from './AdminLayout';
export type { AdminLayoutProps } from './AdminLayout';

// Aliases and default export for backward compatibility
export { default as Layout } from './BaseLayout';
export { default } from './BaseLayout';

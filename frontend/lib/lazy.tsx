/**
 * Lazy loading utilities for code splitting
 * Reduces initial bundle size by loading components on-demand
 */

import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import { Skeleton } from '@/components/ui';

/**
 * Default loading component while chunks are being loaded
 */
export function DefaultLoadingComponent(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Skeleton width="w-12" height="h-12" className="rounded-full" />
      <Skeleton width="w-32" height="h-6" />
    </div>
  );
}

/**
 * Admin pages lazy loading with proper loading states
 */

export const AdminDashboard = dynamic(
  () => import('@/pages/admin/index').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true, // Server-side render for SEO
  }
);

export const AdminActivity = dynamic(
  () => import('@/pages/admin/activity').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true,
  }
);

export const AdminAnalytics = dynamic(
  () => import('@/pages/admin/analytics').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true,
  }
);

export const AdminCategories = dynamic(
  () => import('@/pages/admin/categories').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true,
  }
);

export const AdminTags = dynamic(
  () => import('@/pages/admin/tags').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true,
  }
);

export const AdminTools = dynamic(
  () => import('@/pages/admin/tools').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true,
  }
);

export const AdminUsers = dynamic(
  () => import('@/pages/admin/users/index').then((mod) => mod.default),
  {
    loading: DefaultLoadingComponent,
    ssr: true,
  }
);

/**
 * Component lazy loading utilities
 * Use for heavy components that aren't needed on initial render
 */

/**
 * Lazy load chart components (often heavy)
 */
export function lazyLoadChart<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn as () => Promise<{ default: T }>, {
    loading: () => <Skeleton width="w-full" height="h-64" />,
    ssr: false, // Charts usually don't need SSR
  });
}

/**
 * Lazy load modal components
 */
export function lazyLoadModal<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn as () => Promise<{ default: T }>, {
    loading: () => <div className="text-center py-4">Loading...</div>,
    ssr: false, // Modals don't need SSR
  });
}

/**
 * Lazy load form components
 */
export function lazyLoadForm<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn as () => Promise<{ default: T }>, {
    loading: DefaultLoadingComponent,
    ssr: true,
  });
}

/**
 * Map of all lazy-loaded pages for reference
 */
export const LazyPages = {
  admin: {
    dashboard: AdminDashboard,
    activity: AdminActivity,
    analytics: AdminAnalytics,
    categories: AdminCategories,
    tags: AdminTags,
    tools: AdminTools,
    users: AdminUsers,
  },
};

/**
 * Usage examples:
 *
 * 1. In pages/_app.tsx or middleware, you can use these lazy components:
 *    - const Component = LazyPages.admin.analytics;
 *
 * 2. For custom components:
 *    const MyChart = lazyLoadChart(() => import('@/components/MyChart'));
 *
 * 3. Benefits of code splitting:
 *    - Reduced initial JS bundle size
 *    - Faster initial page load
 *    - Parallel loading of admin chunks
 *    - Better caching (admins get their chunks separately)
 */

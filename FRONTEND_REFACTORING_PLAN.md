# Frontend Refactoring Plan

**Created**: December 18, 2025  
**Stack**: Next.js 15.5.7, React 19, TypeScript, Redux Toolkit, TanStack Query, Tailwind CSS  
**Author**: Senior Developer

---

## Executive Summary

This document outlines a comprehensive refactoring strategy for the frontend codebase. The plan is organized into **6 phases** with prioritized tasks, estimated effort, and expected outcomes. Each phase builds upon the previous, ensuring minimal disruption to ongoing development.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Phase 1: Code Quality & Standards](#phase-1-code-quality--standards)
3. [Phase 2: Architecture Improvements](#phase-2-architecture-improvements)
4. [Phase 3: Component Consolidation](#phase-3-component-consolidation)
5. [Phase 4: State Management Optimization](#phase-4-state-management-optimization)
6. [Phase 5: Performance Optimization](#phase-5-performance-optimization)
7. [Phase 6: Testing & Documentation](#phase-6-testing--documentation)
8. [Implementation Timeline](#implementation-timeline)
9. [Risk Assessment](#risk-assessment)

---

## 1. Current State Analysis

### 1.1 Folder Structure Overview

```
frontend/
├── components/          # 28 component files + subfolders
│   ├── admin/           # 19 admin-specific components
│   ├── comments/        # Comment-related components
│   ├── dashboard/       # Dashboard widgets
│   ├── journal/         # Journal feature components
│   ├── Loading/         # Loading states
│   ├── ratings/         # Rating components
│   ├── TagMultiSelect/  # Tag selection
│   └── tools/           # Tool-related components
├── hooks/               # 10 custom hooks
├── lib/                 # Utilities & API layer
│   └── api/             # Modular API functions
├── pages/               # Next.js pages (Pages Router)
│   └── admin/           # Admin dashboard pages
├── store/               # Redux + RTK Query
│   └── domains/         # Domain-based state slices
├── styles/              # CSS files
├── tests/               # Test files
└── types/               # TypeScript definitions
```

### 1.2 Identified Issues

| Category | Issue | Severity | Files Affected |
|----------|-------|----------|----------------|
| **Architecture** | Mixed patterns (Pages Router but could use App Router) | Medium | All pages |
| **Components** | Duplicate UI patterns across components | High | 20+ files |
| **Styling** | Long inline Tailwind classes | Medium | 50+ files |
| **State** | Some components mix local/global state | Medium | 10+ files |
| **Types** | Some `any` types still exist | Low | 5-10 files |
| **API** | Inconsistent error handling | Medium | API layer |
| **Testing** | Low test coverage (~30%) | High | All components |
| **Performance** | No code splitting strategy | Medium | Pages |
| **Hooks** | Duplicate `useTheme` and `useAppTheme` | Low | 2 files |

### 1.3 Strengths (Keep These)

✅ Well-organized domain-based store structure  
✅ Modular API layer (`lib/api/`)  
✅ RTK Query for server state  
✅ CSS variables for theming  
✅ TypeScript throughout  
✅ ESLint + Prettier configured  
✅ Vitest for testing  

---

## Phase 1: Code Quality & Standards

**Priority**: 🔴 High  
**Effort**: 1-2 days  
**Risk**: Low

### 1.1 Eliminate All `any` Types

**Goal**: 100% type safety

```bash
# Find remaining any types
grep -r "any" --include="*.tsx" --include="*.ts" | grep -v node_modules
```

**Tasks**:
- [ ] Audit all files for `any` types
- [ ] Create proper interfaces for API responses
- [ ] Replace `any` with proper generics or `unknown`
- [ ] Enable strict TypeScript rules in `tsconfig.json`

**Files to check**:
- `pages/tools/[id]/index.tsx` - has `as any` casts
- `components/admin/*.tsx` - activity-related types
- `lib/api/*.ts` - response types

### 1.2 Standardize Import Paths

**Goal**: Consistent, clean imports

**Current Issues**:
```tsx
// Inconsistent paths
import { foo } from '../../lib/api';
import { bar } from '../../../store/domains';
```

**Solution**: Configure path aliases in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/lib/*": ["lib/*"],
      "@/store/*": ["store/*"],
      "@/types/*": ["types/*"]
    }
  }
}
```

**Tasks**:
- [ ] Add path aliases to `tsconfig.json`
- [ ] Update `next.config.ts` for module resolution
- [ ] Run codemod to update all imports
- [ ] Update ESLint import rules

### 1.3 Consolidate Duplicate Hooks

**Issue**: `useTheme.ts` and `useAppTheme.ts` exist

**Tasks**:
- [ ] Audit both hooks for differences
- [ ] Merge into single `useTheme.ts`
- [ ] Update all consumers
- [ ] Delete redundant file

### 1.4 Standardize Error Handling

**Current State**: Mixed approaches across API calls

**Standard Pattern**:
```tsx
// lib/errors.ts - Enhance
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
  }
}

// Usage in API layer
export async function fetchWithError<T>(url: string): Promise<T> {
  const res = await fetchWithAuth(url);
  if (!res.ok) {
    throw new ApiError(res.statusText, res.status);
  }
  return res.json();
}
```

---

## Phase 2: Architecture Improvements

**Priority**: 🟡 Medium  
**Effort**: 3-5 days  
**Risk**: Medium

### 2.1 Evaluate App Router Migration

**Current**: Pages Router (`pages/`)  
**Consider**: App Router (`app/`) for:
- Server Components (better performance)
- Streaming & Suspense
- Parallel Routes
- Better data fetching

**Recommendation**: **Incremental migration**
- Keep Pages Router for existing features
- New features in App Router
- Migrate page-by-page over time

**Migration Order** (if proceeding):
1. Static pages (index, login, register)
2. Dashboard
3. Tools listing
4. Admin pages (last - most complex)

### 2.2 Create Feature-Based Structure

**Current**:
```
components/
├── admin/
├── comments/
├── tools/
└── [mixed files]
```

**Proposed**:
```
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── TwoFactorSetup.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── api/
│       └── auth.ts
├── tools/
│   ├── components/
│   │   ├── ToolEntry.tsx
│   │   ├── ToolForm.tsx
│   │   └── ToolDetail.tsx
│   ├── hooks/
│   │   └── useTools.ts
│   └── api/
│       └── tools.ts
├── admin/
│   ├── components/
│   ├── hooks/
│   └── api/
└── journal/
    ├── components/
    ├── hooks/
    └── api/
```

**Benefits**:
- Co-located code by feature
- Easier to find related files
- Better code splitting potential
- Clearer ownership

### 2.3 Extract Shared UI Library

**Current**: UI components mixed with feature components

**Create**: `components/ui/` for pure, reusable components

```
components/
├── ui/                    # Pure UI (no business logic)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── Skeleton.tsx
│   └── index.ts           # Barrel export
└── [feature components]   # Business logic components
```

**Tasks**:
- [ ] Move pure UI components to `components/ui/`
- [ ] Ensure no business logic in UI components
- [ ] Create barrel export for clean imports
- [ ] Document component props with JSDoc

### 2.4 Implement Consistent Layout System

**Current**: Multiple layout implementations

**Proposed**: Single layout system with composition

```tsx
// components/layouts/BaseLayout.tsx
// components/layouts/AuthLayout.tsx
// components/layouts/AdminLayout.tsx
// components/layouts/DashboardLayout.tsx

// Usage in pages
export default function ToolsPage() {
  return (
    <DashboardLayout>
      <ToolsList />
    </DashboardLayout>
  );
}

ToolsPage.getLayout = (page) => page; // Next.js pattern
```

---

## Phase 3: Component Consolidation

**Priority**: 🟡 Medium  
**Effort**: 2-3 days  
**Risk**: Low

### 3.1 Complete Tailwind Utility Extraction

**Status**: Partially done (`styles/components.css`)

**Remaining Tasks**:
- [ ] Add more utilities for remaining patterns
- [ ] Update `categories.tsx` (similar to tags)
- [ ] Update remaining `tools/*` pages
- [ ] Create form-specific utilities

**New Utilities to Add**:
```css
/* styles/components.css additions */

/* Form Groups */
.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-[var(--text-secondary)];
}

/* Tables */
.table-container {
  @apply overflow-x-auto rounded-lg border border-[var(--border-color)];
}

.table-header {
  @apply text-left p-4 text-[var(--text-secondary)] font-medium;
}

.table-cell {
  @apply p-4 text-[var(--text-primary)];
}

/* Action Links */
.action-link {
  @apply text-[var(--accent)] hover:underline cursor-pointer;
}

.action-link-danger {
  @apply text-red-500 hover:underline cursor-pointer;
}
```

### 3.2 Consolidate Modal Components

**Current State**: 
- ✅ `CreateEditModal.tsx` - Done
- ✅ `ConfirmationModal.tsx` - Done
- ❌ `Modal.tsx` - Legacy, still used in some places
- ❌ `ApprovalModals.tsx` - Could use ConfirmationModal

**Tasks**:
- [ ] Migrate `ApprovalModals.tsx` to use `ConfirmationModal`
- [ ] Deprecate legacy `Modal.tsx`
- [ ] Create `DeleteConfirmationModal` preset
- [ ] Add modal animations (optional)

### 3.3 Consolidate Loading States

**Current**: Multiple loading implementations

**Proposed**: Unified loading system

```tsx
// components/ui/Loading/
├── Spinner.tsx           # Simple spinner
├── Skeleton.tsx          # Content skeleton
├── LoadingOverlay.tsx    # Full-page overlay
├── ButtonLoading.tsx     # Button loading state
└── index.ts

// Usage
import { Spinner, Skeleton, LoadingOverlay } from '@/components/ui/Loading';
```

### 3.4 Consolidate Pagination Components

**Current**: `Pagination.tsx` and `PaginationControls.tsx`

**Tasks**:
- [ ] Analyze differences between components
- [ ] Merge into single `Pagination` component
- [ ] Support multiple styles via props
- [ ] Update all consumers

---

## Phase 4: State Management Optimization

**Priority**: 🟡 Medium  
**Effort**: 2-3 days  
**Risk**: Medium

### 4.1 Audit Redux vs React Query Usage

**Current State**:
- Redux: Theme, Toast, Journal local state
- RTK Query: All API data fetching

**Recommendation**: Keep current split, but:

**Tasks**:
- [ ] Remove any redundant local state that duplicates server state
- [ ] Ensure all server data goes through RTK Query
- [ ] Use Redux only for true client-side state

### 4.2 Optimize Query Key Structure

**Current**: `store/queryKeys.ts`

**Review for**:
- Consistent naming conventions
- Proper cache invalidation
- Optimistic updates where appropriate

**Standard Pattern**:
```typescript
export const queryKeys = {
  tools: {
    all: ['tools'] as const,
    lists: () => [...queryKeys.tools.all, 'list'] as const,
    list: (filters: ToolFilters) => [...queryKeys.tools.lists(), filters] as const,
    details: () => [...queryKeys.tools.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tools.details(), id] as const,
  },
  // ... other domains
};
```

### 4.3 Implement Optimistic Updates

**Candidates for optimistic updates**:
- Tool ratings (star ratings)
- Comment creation
- Tool favorites
- Admin approvals

**Pattern**:
```typescript
const mutation = useMutation({
  mutationFn: updateTool,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['tools', id] });
    const previous = queryClient.getQueryData(['tools', id]);
    queryClient.setQueryData(['tools', id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['tools', id], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tools', id] });
  },
});
```

### 4.4 Add Query Prefetching

**Opportunities**:
- Prefetch tool details on hover
- Prefetch next page in pagination
- Prefetch admin stats on admin layout mount

```typescript
// On tool card hover
const prefetchTool = (id: number) => {
  queryClient.prefetchQuery({
    queryKey: ['tools', 'detail', id],
    queryFn: () => getTool(id),
    staleTime: 60000,
  });
};
```

---

## Phase 5: Performance Optimization

**Priority**: 🟢 Low-Medium  
**Effort**: 2-3 days  
**Risk**: Low

### 5.1 Implement Code Splitting

**Current**: All code in main bundle

**Tasks**:
- [ ] Dynamic import for admin pages
- [ ] Dynamic import for chart libraries
- [ ] Lazy load modals
- [ ] Lazy load heavy components

```typescript
// Dynamic imports
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  loading: () => <Skeleton />,
});

const ChartComponent = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <Skeleton height={300} />,
});
```

### 5.2 Optimize Images

**Current**: Using Next.js Image component (good)

**Additional Tasks**:
- [ ] Audit all images for proper sizing
- [ ] Add blur placeholders for large images
- [ ] Implement progressive loading
- [ ] Use WebP format where possible

### 5.3 Implement Virtual Scrolling

**Already using**: `@tanstack/react-virtual`

**Ensure usage in**:
- [ ] Tool listings (if > 50 items)
- [ ] Activity logs
- [ ] Comment sections (if long)
- [ ] Admin tables

### 5.4 Optimize Re-renders

**Tasks**:
- [ ] Audit components with React DevTools Profiler
- [ ] Add `React.memo()` to expensive pure components
- [ ] Use `useMemo` for expensive computations
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Split large components into smaller ones

**Pattern**:
```typescript
// Before
function ToolList({ tools, onSelect }) {
  return tools.map(t => <ToolCard key={t.id} tool={t} onSelect={onSelect} />);
}

// After
const ToolCard = React.memo(function ToolCard({ tool, onSelect }) {
  const handleSelect = useCallback(() => onSelect(tool.id), [tool.id, onSelect]);
  return <div onClick={handleSelect}>...</div>;
});
```

### 5.5 Add Performance Monitoring

**Tasks**:
- [ ] Implement Web Vitals tracking
- [ ] Add performance budgets to CI
- [ ] Set up Lighthouse CI

```typescript
// pages/_app.tsx
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric); // or send to analytics
  }
}
```

---

## Phase 6: Testing & Documentation

**Priority**: 🔴 High  
**Effort**: 5-7 days  
**Risk**: Low

### 6.1 Increase Test Coverage

**Current**: ~30% coverage (estimated)  
**Target**: 70%+ coverage

**Priority Order**:
1. **Critical paths** (auth, payments, admin actions)
2. **Shared hooks** (useAuth, useTools, etc.)
3. **UI components** (buttons, inputs, modals)
4. **Feature components** (tool forms, admin tables)
5. **Pages** (integration tests)

**Test Structure**:
```
tests/
├── unit/
│   ├── hooks/
│   ├── components/
│   └── lib/
├── integration/
│   ├── pages/
│   └── features/
└── e2e/              # Future: Playwright/Cypress
    └── flows/
```

### 6.2 Add Component Stories (Storybook)

**Tasks**:
- [ ] Install Storybook
- [ ] Create stories for UI components
- [ ] Document component variants
- [ ] Add interaction tests

```bash
npx storybook@latest init
```

### 6.3 Create Component Documentation

**For each shared component**:
- [ ] JSDoc comments on props
- [ ] Usage examples
- [ ] Accessibility notes
- [ ] Related components

```typescript
/**
 * Primary button component with loading state support.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" loading={isSubmitting}>
 *   Submit
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Button contents */
  children: React.ReactNode;
}
```

### 6.4 API Documentation

**Tasks**:
- [ ] Document all API functions in `lib/api/`
- [ ] Create API response type definitions
- [ ] Add error code documentation
- [ ] Create API usage guide

### 6.5 Architecture Decision Records (ADRs)

**Create ADRs for**:
- [ ] State management approach
- [ ] API layer design
- [ ] Component organization
- [ ] Testing strategy
- [ ] Styling approach

---

## Implementation Timeline

### Week 1: Foundation (Phase 1)

| Day | Tasks | Owner |
|-----|-------|-------|
| 1 | Eliminate `any` types, audit codebase | Dev |
| 2 | Configure path aliases, update imports | Dev |
| 3 | Consolidate hooks, standardize error handling | Dev |

### Week 2: Architecture (Phase 2)

| Day | Tasks | Owner |
|-----|-------|-------|
| 1-2 | Evaluate/plan App Router migration | Lead |
| 3-4 | Create feature-based structure | Dev |
| 5 | Extract shared UI library | Dev |

### Week 3: Components (Phase 3)

| Day | Tasks | Owner |
|-----|-------|-------|
| 1 | Complete Tailwind utility extraction | Dev |
| 2 | Consolidate modals | Dev |
| 3 | Consolidate loading/pagination | Dev |

### Week 4: State & Performance (Phase 4 & 5)

| Day | Tasks | Owner |
|-----|-------|-------|
| 1-2 | Optimize state management | Dev |
| 3-4 | Implement code splitting | Dev |
| 5 | Performance audit & fixes | Dev |

### Week 5-6: Testing (Phase 6)

| Day | Tasks | Owner |
|-----|-------|-------|
| 1-3 | Write unit tests for hooks | Dev |
| 4-5 | Write component tests | Dev |
| 6-7 | Integration tests | Dev |
| 8-10 | Documentation | Dev |

---

## Risk Assessment

### High Risk Items

| Item | Risk | Mitigation |
|------|------|------------|
| App Router migration | Breaking changes | Incremental migration, feature flags |
| State restructuring | Data loss | Thorough testing, rollback plan |
| Path alias changes | Build failures | CI validation before merge |

### Medium Risk Items

| Item | Risk | Mitigation |
|------|------|------------|
| Component consolidation | Regression bugs | Visual regression tests |
| Performance changes | User-facing issues | A/B testing, monitoring |

### Low Risk Items

| Item | Risk | Mitigation |
|------|------|------------|
| Adding tests | None | Just do it |
| Documentation | None | Just do it |
| CSS refactoring | Minor visual changes | Visual review |

---

## Success Metrics

### Code Quality
- [ ] 0 TypeScript `any` types
- [ ] 0 ESLint errors
- [ ] 100% Prettier compliance
- [ ] All imports using path aliases

### Performance
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 200KB (initial)

### Testing
- [ ] 70%+ code coverage
- [ ] All critical paths tested
- [ ] No flaky tests

### Developer Experience
- [ ] New feature setup < 30 min
- [ ] PR review time < 2 hours
- [ ] Build time < 60s

---

## Quick Wins (Do Now)

These can be done immediately with minimal risk:

1. **Complete Tailwind utility migration** (2-3 hours)
2. **Add path aliases** (1 hour)
3. **Merge duplicate hooks** (30 min)
4. **Add JSDoc to shared components** (2 hours)
5. **Increase test coverage for hooks** (4 hours)

---

## Appendix

### A. File Count by Category

| Category | Count |
|----------|-------|
| Pages | 12 |
| Components | 47 |
| Hooks | 10 |
| API modules | 15 |
| Store slices | 8 |
| Test files | 15 |

### B. Dependencies to Review

| Package | Current | Latest | Action |
|---------|---------|--------|--------|
| next | 15.5.7 | 15.x | Keep |
| react | 19.1.0 | 19.x | Keep |
| @tanstack/react-query | 5.90.12 | 5.x | Keep |
| formik | 2.4.9 | 2.x | Consider react-hook-form |

### C. Related Documentation

- [Next.js App Router Migration](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [RTK Query Best Practices](https://redux-toolkit.js.org/rtk-query/usage/queries)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)
- [Vitest Documentation](https://vitest.dev/)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-18 | 1.0 | Initial plan created |

---

**Next Steps**: Review this plan with the team, prioritize based on current sprint capacity, and begin with Phase 1 quick wins.

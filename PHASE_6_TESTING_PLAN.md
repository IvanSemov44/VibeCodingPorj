# Phase 6: Comprehensive Testing & Documentation Plan

## Executive Summary

**Phase**: 6 - Testing & Documentation  
**Priority**: 🟡 Medium-High  
**Estimated Effort**: 5-7 days  
**Goal**: Achieve 70%+ test coverage with comprehensive documentation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Testing Strategy](#2-testing-strategy)
3. [Test Architecture](#3-test-architecture)
4. [Implementation Plan](#4-implementation-plan)
5. [Test Categories](#5-test-categories)
6. [Priority Matrix](#6-priority-matrix)
7. [File Structure](#7-file-structure)
8. [Testing Utilities](#8-testing-utilities)
9. [Documentation Plan](#9-documentation-plan)
10. [Timeline](#10-timeline)
11. [Success Metrics](#11-success-metrics)

---

## 1. Overview

### Current State
- Previous test folder removed (fresh start)
- TypeScript strict mode enabled
- React Query + Redux Toolkit for state
- Next.js 15.5.7 with Pages Router
- Vitest configured for testing

### Target State
- 70%+ code coverage
- Unit tests for all utilities
- Component tests for UI library
- Integration tests for key flows
- E2E tests for critical paths
- Comprehensive documentation

### Testing Stack
```
Unit Tests:        Vitest + React Testing Library
Component Tests:   Vitest + RTL + MSW
Integration Tests: Vitest + MSW
E2E Tests:         Playwright (optional)
Mocking:           MSW (Mock Service Worker)
Coverage:          Vitest built-in (c8/istanbul)
```

---

## 2. Testing Strategy

### 2.1 Testing Pyramid

```
                    ┌─────────┐
                    │   E2E   │  5% - Critical paths only
                   ┌┴─────────┴┐
                   │Integration│  25% - User flows
                  ┌┴───────────┴┐
                  │  Component  │  30% - UI components
                 ┌┴─────────────┴┐
                 │     Unit      │  40% - Functions, hooks, utils
                 └───────────────┘
```

### 2.2 What to Test

**Must Test (High Priority)**:
- Authentication flows (login, logout, 2FA)
- Data mutations (create, update, delete)
- Form validation
- Error handling
- Custom hooks
- Utility functions
- API integration

**Should Test (Medium Priority)**:
- UI components (visual states)
- Navigation flows
- Toast notifications
- Loading states
- Pagination

**Nice to Have (Lower Priority)**:
- Animation transitions
- Responsive layouts
- Accessibility (a11y)
- Performance metrics

### 2.3 What NOT to Test

- Third-party library internals
- Next.js framework code
- CSS styling (use visual regression if needed)
- Generated types
- Static content without logic

---

## 3. Test Architecture

### 3.1 Directory Structure

```
frontend/
├── tests/
│   ├── __mocks__/                    # Global mocks
│   │   ├── next/
│   │   │   ├── router.ts             # Next.js router mock
│   │   │   └── image.ts              # Next.js Image mock
│   │   ├── zustand.ts                # State mock (if used)
│   │   └── fileMock.ts               # Static file mock
│   │
│   ├── fixtures/                     # Test data fixtures
│   │   ├── users.ts                  # User test data
│   │   ├── tools.ts                  # Tool test data
│   │   ├── categories.ts             # Category test data
│   │   ├── tags.ts                   # Tag test data
│   │   └── index.ts                  # Barrel export
│   │
│   ├── msw/                          # MSW handlers
│   │   ├── handlers/
│   │   │   ├── auth.ts               # Auth API handlers
│   │   │   ├── tools.ts              # Tools API handlers
│   │   │   ├── categories.ts         # Categories API handlers
│   │   │   ├── tags.ts               # Tags API handlers
│   │   │   ├── users.ts              # Users API handlers
│   │   │   ├── admin.ts              # Admin API handlers
│   │   │   └── index.ts              # Combined handlers
│   │   ├── server.ts                 # MSW server setup
│   │   └── browser.ts                # MSW browser setup
│   │
│   ├── utils/                        # Test utilities
│   │   ├── render.tsx                # Custom render with providers
│   │   ├── test-utils.ts             # Common test utilities
│   │   ├── query-client.ts           # Test query client
│   │   └── store.ts                  # Test store setup
│   │
│   ├── unit/                         # Unit tests
│   │   ├── lib/                      # Library function tests
│   │   │   ├── api.test.ts
│   │   │   ├── imageOptimization.test.ts
│   │   │   ├── validation.test.ts
│   │   │   └── utils.test.ts
│   │   ├── hooks/                    # Custom hook tests
│   │   │   ├── useAuth.test.ts
│   │   │   ├── useToast.test.ts
│   │   │   ├── useTheme.test.ts
│   │   │   └── useFileUpload.test.ts
│   │   └── store/                    # Store tests
│   │       ├── queryKeys.test.ts
│   │       ├── optimisticUpdate.test.ts
│   │       └── prefetch.test.ts
│   │
│   ├── components/                   # Component tests
│   │   ├── ui/                       # UI library tests
│   │   │   ├── Alert.test.tsx
│   │   │   ├── Badge.test.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Card.test.tsx
│   │   │   ├── Input.test.tsx
│   │   │   ├── Modal.test.tsx
│   │   │   └── Loading.test.tsx
│   │   ├── layouts/                  # Layout tests
│   │   │   ├── BaseLayout.test.tsx
│   │   │   ├── AuthLayout.test.tsx
│   │   │   └── AdminLayout.test.tsx
│   │   ├── forms/                    # Form component tests
│   │   │   ├── ToolForm.test.tsx
│   │   │   ├── LoginForm.test.tsx
│   │   │   └── RegisterForm.test.tsx
│   │   └── features/                 # Feature component tests
│   │       ├── ToolEntry.test.tsx
│   │       ├── TagMultiSelect.test.tsx
│   │       ├── CommentList.test.tsx
│   │       └── StarRating.test.tsx
│   │
│   ├── integration/                  # Integration tests
│   │   ├── auth/
│   │   │   ├── login.test.tsx
│   │   │   ├── logout.test.tsx
│   │   │   ├── register.test.tsx
│   │   │   └── twoFactor.test.tsx
│   │   ├── tools/
│   │   │   ├── create-tool.test.tsx
│   │   │   ├── edit-tool.test.tsx
│   │   │   ├── delete-tool.test.tsx
│   │   │   └── tool-list.test.tsx
│   │   ├── admin/
│   │   │   ├── dashboard.test.tsx
│   │   │   ├── user-management.test.tsx
│   │   │   └── tool-approval.test.tsx
│   │   └── user/
│   │       ├── profile.test.tsx
│   │       └── dashboard.test.tsx
│   │
│   ├── e2e/                          # End-to-end tests (Playwright)
│   │   ├── auth.spec.ts
│   │   ├── tools.spec.ts
│   │   └── admin.spec.ts
│   │
│   └── setup/                        # Test setup
│       ├── vitest.setup.ts           # Vitest setup
│       ├── jest.setup.ts             # Jest compat (if needed)
│       └── global-setup.ts           # Global setup
```

### 3.2 Test File Naming Convention

```
Pattern: [name].[type].ts(x)

Types:
  .test.ts(x)    - Unit/Component tests
  .spec.ts(x)    - Integration/E2E tests
  .mock.ts       - Mock files

Examples:
  useAuth.test.ts        - Unit test for useAuth hook
  Button.test.tsx        - Component test for Button
  login.spec.tsx         - Integration test for login flow
  auth.handlers.ts       - MSW handlers for auth
```

---

## 4. Implementation Plan

### Phase 6.1: Test Infrastructure (Day 1)

**Objective**: Set up testing infrastructure

**Tasks**:
- [ ] Create test directory structure
- [ ] Configure Vitest with proper settings
- [ ] Set up MSW for API mocking
- [ ] Create custom render function with providers
- [ ] Create test fixtures
- [ ] Set up coverage reporting

**Deliverables**:
```
tests/
├── __mocks__/
├── fixtures/
├── msw/
├── utils/
└── setup/
```

### Phase 6.2: Unit Tests (Days 2-3)

**Objective**: Test utility functions, hooks, and store logic

**Tasks**:
- [ ] Test lib/api functions
- [ ] Test lib/imageOptimization utilities
- [ ] Test lib/validation schemas
- [ ] Test custom hooks (useAuth, useToast, useTheme, etc.)
- [ ] Test store utilities (queryKeys, optimisticUpdate, prefetch)
- [ ] Test Redux slices

**Coverage Target**: 80%+ for utilities

### Phase 6.3: Component Tests (Days 3-4)

**Objective**: Test UI components in isolation

**Tasks**:
- [ ] Test UI library components (Alert, Badge, Button, etc.)
- [ ] Test layout components (BaseLayout, AuthLayout, AdminLayout)
- [ ] Test form components (ToolForm, LoginForm, etc.)
- [ ] Test feature components (ToolEntry, TagMultiSelect, etc.)

**Coverage Target**: 70%+ for components

### Phase 6.4: Integration Tests (Days 4-5)

**Objective**: Test user flows and API integration

**Tasks**:
- [ ] Test authentication flows (login, logout, register, 2FA)
- [ ] Test tool CRUD operations
- [ ] Test admin workflows
- [ ] Test user dashboard

**Coverage Target**: 60%+ for flows

### Phase 6.5: E2E Tests (Day 6 - Optional)

**Objective**: Test critical paths end-to-end

**Tasks**:
- [ ] Set up Playwright
- [ ] Test login → dashboard flow
- [ ] Test create tool flow
- [ ] Test admin approval flow

**Coverage Target**: Critical paths only

### Phase 6.6: Documentation (Day 7)

**Objective**: Comprehensive documentation

**Tasks**:
- [ ] Document testing patterns
- [ ] Create test writing guide
- [ ] Document component usage
- [ ] Update README with test instructions
- [ ] Create API documentation

---

## 5. Test Categories

### 5.1 Unit Tests

#### Library Functions

```typescript
// tests/unit/lib/imageOptimization.test.ts
import { describe, it, expect } from 'vitest';
import { 
  generateBlurDataUrl, 
  getImageOptimizationProps 
} from '@/lib/imageOptimization';

describe('imageOptimization', () => {
  describe('generateBlurDataUrl', () => {
    it('should generate a valid data URL', () => {
      const result = generateBlurDataUrl('#e5e7eb');
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should use default color when not provided', () => {
      const result = generateBlurDataUrl();
      expect(result).toBeDefined();
    });
  });

  describe('getImageOptimizationProps', () => {
    it('should return correct props for thumbnail', () => {
      const props = getImageOptimizationProps('thumbnail');
      expect(props.width).toBe(96);
      expect(props.height).toBe(64);
      expect(props.placeholder).toBe('blur');
    });

    it('should return correct props for screenshot_full', () => {
      const props = getImageOptimizationProps('screenshot_full');
      expect(props.width).toBe(400);
      expect(props.height).toBe(260);
    });
  });
});
```

#### Custom Hooks

```typescript
// tests/unit/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { createWrapper } from '../../utils/render';

describe('useAuth', () => {
  it('should return user when authenticated', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should return null when not authenticated', async () => {
    // Mock unauthenticated state
    const { result } = renderHook(() => useAuth(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
  });
});
```

#### Store Utilities

```typescript
// tests/unit/store/queryKeys.test.ts
import { describe, it, expect } from 'vitest';
import { QUERY_KEYS } from '@/store/queryKeys';

describe('QUERY_KEYS', () => {
  describe('tools', () => {
    it('should return correct key for all tools', () => {
      expect(QUERY_KEYS.tools.all).toEqual(['tools']);
    });

    it('should return correct key for tool detail', () => {
      expect(QUERY_KEYS.tools.detail(1)).toEqual(['tools', 'detail', 1]);
    });

    it('should return correct key for tool list with filters', () => {
      const filters = { category: 'ai', page: 1 };
      expect(QUERY_KEYS.tools.list(filters)).toEqual(['tools', 'list', filters]);
    });
  });
});
```

### 5.2 Component Tests

#### UI Components

```typescript
// tests/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

#### Modal Component

```typescript
// tests/components/ui/Modal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '@/components/ui';

describe('Modal', () => {
  it('should render when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    );
    
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});
```

### 5.3 Integration Tests

#### Login Flow

```typescript
// tests/integration/auth/login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../../msw/server';
import { rest } from 'msw';
import LoginPage from '@/pages/login';
import { createWrapper } from '../../utils/render';

describe('Login Flow', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should login successfully with valid credentials', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('should show error message for invalid credentials', async () => {
    server.use(
      rest.post('/api/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
      })
    );
    
    render(<LoginPage />, { wrapper: createWrapper() });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

#### Tool Creation Flow

```typescript
// tests/integration/tools/create-tool.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NewToolPage from '@/pages/tools/new';
import { createWrapper } from '../../utils/render';

describe('Create Tool Flow', () => {
  it('should create a tool with valid data', async () => {
    render(<NewToolPage />, { wrapper: createWrapper() });
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Tool' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A test tool description' },
    });
    fireEvent.change(screen.getByLabelText(/url/i), {
      target: { value: 'https://test-tool.com' },
    });
    
    // Select category
    fireEvent.click(screen.getByLabelText(/category/i));
    fireEvent.click(screen.getByText(/ai tools/i));
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create tool/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/tool created successfully/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors for required fields', async () => {
    render(<NewToolPage />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByRole('button', { name: /create tool/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

---

## 6. Priority Matrix

### High Priority (Must Have)

| Category | Tests | Coverage Target |
|----------|-------|-----------------|
| **Auth Hooks** | useAuth, useLogout | 90% |
| **API Functions** | api.ts, public.ts | 85% |
| **Form Validation** | Yup schemas | 90% |
| **UI Components** | Button, Modal, Input | 80% |
| **Auth Flows** | Login, Logout, Register | 80% |
| **Tool CRUD** | Create, Edit, Delete | 75% |

### Medium Priority (Should Have)

| Category | Tests | Coverage Target |
|----------|-------|-----------------|
| **Custom Hooks** | useToast, useTheme | 75% |
| **Store Utilities** | queryKeys, prefetch | 70% |
| **Layouts** | BaseLayout, AdminLayout | 70% |
| **Admin Flows** | Dashboard, User Mgmt | 65% |
| **Image Utils** | imageOptimization | 70% |

### Lower Priority (Nice to Have)

| Category | Tests | Coverage Target |
|----------|-------|-----------------|
| **E2E Tests** | Critical paths | 50% |
| **Accessibility** | ARIA, keyboard nav | 60% |
| **Performance** | Lazy loading | 50% |
| **Visual** | Snapshot tests | Optional |

---

## 7. File Structure

### Test Files to Create

```
tests/
├── __mocks__/
│   ├── next/
│   │   ├── router.ts                 # Mock next/router
│   │   └── image.ts                  # Mock next/image
│   └── fileMock.ts                   # Mock static files
│
├── fixtures/
│   ├── users.ts                      # User fixtures
│   ├── tools.ts                      # Tool fixtures
│   ├── categories.ts                 # Category fixtures
│   ├── tags.ts                       # Tag fixtures
│   └── index.ts                      # Export all fixtures
│
├── msw/
│   ├── handlers/
│   │   ├── auth.ts                   # Auth API mocks
│   │   ├── tools.ts                  # Tools API mocks
│   │   ├── categories.ts             # Categories API mocks
│   │   ├── tags.ts                   # Tags API mocks
│   │   ├── users.ts                  # Users API mocks
│   │   ├── admin.ts                  # Admin API mocks
│   │   └── index.ts                  # Combined handlers
│   └── server.ts                     # MSW server setup
│
├── utils/
│   ├── render.tsx                    # Custom render with providers
│   ├── test-utils.ts                 # Common utilities
│   ├── query-client.ts               # React Query test client
│   └── store.ts                      # Redux test store
│
├── setup/
│   └── vitest.setup.ts               # Vitest global setup
│
├── unit/
│   ├── lib/
│   │   ├── api.test.ts               # API tests
│   │   ├── imageOptimization.test.ts # Image utils tests
│   │   ├── validation.test.ts        # Validation tests
│   │   └── utils.test.ts             # General utils tests
│   ├── hooks/
│   │   ├── useAuth.test.ts           # Auth hook tests
│   │   ├── useToast.test.ts          # Toast hook tests
│   │   ├── useTheme.test.ts          # Theme hook tests
│   │   └── useFileUpload.test.ts     # File upload tests
│   └── store/
│       ├── queryKeys.test.ts         # Query keys tests
│       ├── optimisticUpdate.test.ts  # Optimistic update tests
│       └── prefetch.test.ts          # Prefetch tests
│
├── components/
│   ├── ui/
│   │   ├── Alert.test.tsx
│   │   ├── Badge.test.tsx
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── Input.test.tsx
│   │   ├── Modal.test.tsx
│   │   └── Loading.test.tsx
│   ├── layouts/
│   │   ├── BaseLayout.test.tsx
│   │   ├── AuthLayout.test.tsx
│   │   └── AdminLayout.test.tsx
│   ├── forms/
│   │   ├── ToolForm.test.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── RegisterForm.test.tsx
│   └── features/
│       ├── ToolEntry.test.tsx
│       ├── TagMultiSelect.test.tsx
│       ├── CommentList.test.tsx
│       └── StarRating.test.tsx
│
└── integration/
    ├── auth/
    │   ├── login.test.tsx
    │   ├── logout.test.tsx
    │   ├── register.test.tsx
    │   └── twoFactor.test.tsx
    ├── tools/
    │   ├── create-tool.test.tsx
    │   ├── edit-tool.test.tsx
    │   ├── delete-tool.test.tsx
    │   └── tool-list.test.tsx
    ├── admin/
    │   ├── dashboard.test.tsx
    │   ├── user-management.test.tsx
    │   └── tool-approval.test.tsx
    └── user/
        ├── profile.test.tsx
        └── dashboard.test.tsx
```

### Total Files to Create

| Category | Files | Est. Lines |
|----------|-------|------------|
| Mocks | 3 | ~150 |
| Fixtures | 5 | ~200 |
| MSW Handlers | 7 | ~350 |
| Utils | 4 | ~200 |
| Setup | 1 | ~50 |
| Unit Tests | 12 | ~800 |
| Component Tests | 14 | ~1,200 |
| Integration Tests | 12 | ~1,000 |
| **Total** | **58** | **~4,000** |

---

## 8. Testing Utilities

### Custom Render Function

```typescript
// tests/utils/render.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@/components/ThemeProvider';
import themeReducer from '@/store/themeSlice';
import toastReducer from '@/store/toastSlice';

// Create test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Create test store
function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      theme: themeReducer,
      toast: toastReducer,
    },
    preloadedState,
  });
}

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  store?: ReturnType<typeof createTestStore>;
}

function AllProviders({ 
  children, 
  queryClient = createTestQueryClient(),
  store = createTestStore(),
}: AllProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

// Custom render
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
    store?: ReturnType<typeof createTestStore>;
    preloadedState?: Record<string, unknown>;
  }
) => {
  const { queryClient, store, preloadedState, ...renderOptions } = options || {};
  
  const testStore = store || createTestStore(preloadedState);
  const testQueryClient = queryClient || createTestQueryClient();
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={testQueryClient} store={testStore}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
};

// Create wrapper for hooks testing
export function createWrapper(options?: {
  queryClient?: QueryClient;
  store?: ReturnType<typeof createTestStore>;
}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AllProviders {...options}>
        {children}
      </AllProviders>
    );
  };
}

export * from '@testing-library/react';
export { customRender as render, createTestQueryClient, createTestStore };
```

### MSW Server Setup

```typescript
// tests/msw/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Enable request interception
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### Test Fixtures

```typescript
// tests/fixtures/users.ts
import type { User } from '@/lib/types';

export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  roles: ['user'],
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAdminUser: User = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  roles: ['admin', 'user'],
  created_at: '2024-01-01T00:00:00Z',
};

export const mockUsers: User[] = [
  mockUser,
  mockAdminUser,
  {
    id: 3,
    name: 'Another User',
    email: 'another@example.com',
    roles: ['user'],
    created_at: '2024-01-02T00:00:00Z',
  },
];
```

```typescript
// tests/fixtures/tools.ts
import type { Tool } from '@/lib/types';

export const mockTool: Tool = {
  id: 1,
  name: 'Test Tool',
  description: 'A test tool for testing',
  url: 'https://test-tool.com',
  category: { id: 1, name: 'AI Tools', slug: 'ai-tools' },
  tags: [{ id: 1, name: 'ai', slug: 'ai' }],
  screenshots: ['https://example.com/screenshot.jpg'],
  average_rating: 4.5,
  rating_count: 10,
  status: 'approved',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockTools: Tool[] = [
  mockTool,
  {
    ...mockTool,
    id: 2,
    name: 'Another Tool',
    description: 'Another test tool',
  },
];
```

---

## 9. Documentation Plan

### 9.1 Technical Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **TEST_README.md** | Testing overview | `tests/` |
| **COMPONENT_DOCS.md** | Component usage | `docs/` |
| **API_DOCS.md** | API integration | `docs/` |
| **ARCHITECTURE.md** | System architecture | `docs/` |

### 9.2 Test Documentation

```markdown
# Test Documentation Template

## Component: [ComponentName]

### Description
Brief description of what the component does.

### Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | string | Yes | - | Description |

### Usage Example
\`\`\`tsx
import { Component } from '@/components/ui';

<Component prop1="value" />
\`\`\`

### Test Cases
1. Should render with required props
2. Should handle click events
3. Should show loading state
4. Should be accessible

### Test File
`tests/components/ui/ComponentName.test.tsx`
```

### 9.3 README Updates

```markdown
# Testing

## Running Tests

\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/unit/lib/api.test.ts

# Run tests matching pattern
npm run test -- --grep "useAuth"
\`\`\`

## Test Structure

- `tests/unit/` - Unit tests for functions and hooks
- `tests/components/` - Component tests with RTL
- `tests/integration/` - Integration tests for user flows
- `tests/e2e/` - End-to-end tests (Playwright)

## Coverage Targets

- Overall: 70%+
- Utilities: 80%+
- Components: 70%+
- Integration: 60%+

## Writing Tests

See `tests/TEST_README.md` for detailed guidelines.
```

---

## 10. Timeline

### Week 1: Core Testing (Days 1-5)

| Day | Tasks | Deliverables |
|-----|-------|--------------|
| **Day 1** | Infrastructure | Mocks, fixtures, MSW, utils |
| **Day 2** | Unit Tests (Part 1) | Lib functions, validation |
| **Day 3** | Unit Tests (Part 2) | Hooks, store utilities |
| **Day 4** | Component Tests | UI library, layouts |
| **Day 5** | Integration Tests | Auth, tools flows |

### Week 1: Documentation & Polish (Days 6-7)

| Day | Tasks | Deliverables |
|-----|-------|--------------|
| **Day 6** | More Integration + E2E | Admin flows, E2E setup |
| **Day 7** | Documentation | Guides, README, coverage report |

### Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Infrastructure | Day 1 | ⬜ |
| Unit Tests | Day 3 | ⬜ |
| Component Tests | Day 4 | ⬜ |
| Integration Tests | Day 5 | ⬜ |
| Documentation | Day 7 | ⬜ |
| **Phase Complete** | **Day 7** | ⬜ |

---

## 11. Success Metrics

### Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| **Overall** | 70% | 0% |
| **Statements** | 70% | 0% |
| **Branches** | 65% | 0% |
| **Functions** | 75% | 0% |
| **Lines** | 70% | 0% |

### Per-Category Coverage

| Category | Files | Target | Priority |
|----------|-------|--------|----------|
| lib/ | 8 | 80% | High |
| hooks/ | 10 | 75% | High |
| store/ | 6 | 70% | Medium |
| components/ui/ | 7 | 80% | High |
| components/layouts/ | 3 | 70% | Medium |
| components/forms/ | 5 | 75% | High |
| pages/ (integration) | 12 | 60% | Medium |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Test execution time | < 30 seconds |
| Flaky test rate | < 1% |
| Test isolation | 100% (no shared state) |
| Mock coverage | 100% (all API calls mocked) |

---

## 12. Getting Started

### Prerequisites

```bash
# Install dependencies (if not already)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitejs/plugin-react
```

### Initial Setup

```bash
# Create test directory structure
mkdir -p tests/{__mocks__/next,fixtures,msw/handlers,utils,setup,unit/{lib,hooks,store},components/{ui,layouts,forms,features},integration/{auth,tools,admin,user}}
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

---

## Summary

### Phase 6 Objectives

✅ **Infrastructure**: Complete test setup with MSW, fixtures, utilities  
✅ **Unit Tests**: 80%+ coverage for utilities, hooks, store  
✅ **Component Tests**: 70%+ coverage for UI library  
✅ **Integration Tests**: 60%+ coverage for user flows  
✅ **Documentation**: Comprehensive guides and README  

### Deliverables

| Category | Count |
|----------|-------|
| Test Files | ~58 files |
| Lines of Test Code | ~4,000 lines |
| Documentation Files | ~5 files |
| Coverage Target | 70%+ |

### Timeline

- **Duration**: 5-7 days
- **Start**: After Phase 5 completion
- **End**: Full test suite with documentation

---

**Status**: 📋 **PLANNED** - Ready for implementation

**Next Steps**:
1. Set up test infrastructure (Day 1)
2. Create fixtures and MSW handlers
3. Begin unit tests for critical paths
4. Progress through test categories
5. Complete documentation

---

**Document Created**: Phase 6 Comprehensive Testing Plan  
**Estimated Completion**: 5-7 days  
**Target Coverage**: 70%+

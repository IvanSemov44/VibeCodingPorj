# Frontend Refactoring Plan - Component Splitting & Best Practices

## Executive Summary

This document outlines a comprehensive refactoring plan to improve code quality, maintainability, and follow React/Next.js best practices. The current codebase has several **monolithic components** (280+ lines), **inline styles everywhere**, **mixed concerns**, and **missing abstraction layers**.

---

## Critical Issues Identified

### 🔴 High Priority

1. **JournalSection.tsx** (280 lines) - Massive component doing everything
2. **ToolForm.tsx** (249 lines) - God component with mixed concerns
3. **dashboard.tsx** (226 lines) - Multiple inline components and hardcoded data
4. **Inline styles** - No CSS organization, maintenance nightmare
5. **Missing custom hooks** - Stateful logic embedded in components
6. **No component composition** - Monolithic components instead of composition

### 🟡 Medium Priority

7. **Repetitive form patterns** - Login/Register have duplicated logic
8. **Hardcoded constants** - Scattered across components
9. **Mixed container/presentational** - No clear separation
10. **Missing error boundaries** - No global error handling
11. **Loading states** - Inconsistent patterns

### 🟢 Low Priority

12. **Accessibility** - Missing ARIA labels
13. **Performance optimizations** - Missing memo/useMemo/useCallback
14. **TypeScript strictness** - Can be improved

---

## Refactoring Strategy

### Phase 1: Extract Constants & Types ✅ (Quick Win)
### Phase 2: Create Reusable Hooks 🎯 (Foundation)
### Phase 3: Split Large Components 🏗️ (Main Work)
### Phase 4: Improve Styling 🎨 (Architecture)
### Phase 5: Add Error Handling & Performance 🚀 (Polish)

---

## Phase 1: Extract Constants & Types (2 hours)

### 1.1 Create Constants Files

**File: `lib/constants/journal.ts`**
```typescript
export const MOOD_OPTIONS = [
  { value: 'excited', emoji: '🚀', label: 'Excited', color: '#f59e0b' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
  // ... etc
] as const;

export const TAG_OPTIONS = [
  'Backend', 'Frontend', 'Bug Fix', 'Feature Quest', 'Refactor',
  // ... etc
] as const;
```

**File: `lib/constants/dashboard.ts`**
```typescript
export const ROLE_COLORS = {
  owner: 'error',
  backend: 'primary',
  // ... etc
} as const;

export const ROLE_TITLES = {
  owner: 'Admin Dashboard',
  // ... etc
} as const;
```

**Impact**: Centralized configuration, easier maintenance, type-safe

---

## Phase 2: Create Reusable Hooks (4-6 hours)

### 2.1 Journal Hooks

**File: `hooks/useJournal.ts`**
```typescript
export function useJournal(filters: JournalFilters) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    // ... implementation
  }, [filters]);

  const createEntry = useCallback(async (data: JournalCreatePayload) => {
    // ... implementation
  }, []);

  const deleteEntry = useCallback(async (id: number) => {
    // ... implementation
  }, []);

  return { entries, stats, loading, error, loadData, createEntry, deleteEntry };
}
```

**Impact**: Separation of concerns, reusable logic, testable

### 2.2 Form Hooks

**File: `hooks/useJournalForm.ts`**
```typescript
export function useJournalForm(onSubmit: (data: JournalFormData) => Promise<void>) {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    // ... validation & submission logic
  };

  const toggleTag = (tag: string) => {
    // ... tag toggle logic
  };

  return { formData, setFormData, submitting, formError, handleSubmit, toggleTag };
}
```

**Impact**: Reusable form logic, easier testing, cleaner components

### 2.3 File Upload Hook

**File: `hooks/useFileUpload.ts`**
```typescript
export function useFileUpload(maxFiles = 10) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... file handling logic
  };

  const removeFile = (index: number) => {
    // ... remove logic
  };

  const uploadFiles = async (uploadFn: (files: File[]) => Promise<void>) => {
    // ... upload logic
  };

  return { fileInputRef, files, previews, uploading, handleFileSelect, removeFile, uploadFiles };
}
```

**Impact**: Reusable file upload logic, consistent UX

### 2.4 Filters Hook

**File: `hooks/useFilters.ts`**
```typescript
export function useFilters<T>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => val !== '');
  }, [filters]);

  return { filters, updateFilter, clearFilters, hasActiveFilters };
}
```

**Impact**: Reusable filter logic, cleaner component code

---

## Phase 3: Split Large Components (8-12 hours)

### 3.1 JournalSection Refactoring

**Current**: 280 lines, 1 file
**Target**: 8 components, 5 files

#### New Structure:
```
components/journal/
├── JournalSection.tsx         # Main container (50 lines)
├── JournalHeader.tsx          # Header with stats (40 lines)
├── JournalStats.tsx           # Stats grid (30 lines)
├── JournalForm.tsx            # Entry creation form (80 lines)
├── JournalFilters.tsx         # Search & filter controls (50 lines)
├── JournalList.tsx            # List container (30 lines)
├── JournalEntry.tsx           # Already exists, may need updates
└── components/
    ├── MoodSelector.tsx       # Mood button group (30 lines)
    ├── TagSelector.tsx        # Tag multi-select (30 lines)
    └── XPSlider.tsx           # XP range input (20 lines)
```

**Example: JournalSection.tsx** (Container)
```typescript
export default function JournalSection() {
  const [showForm, setShowForm] = useState(false);
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useFilters(initialFilters);
  const { entries, stats, loading, createEntry, deleteEntry } = useJournal(filters);
  const formHook = useJournalForm(async (data) => {
    await createEntry(data);
    setShowForm(false);
  });

  if (loading && !stats) return <LoadingPage message="Loading your adventure journal..." />;

  return (
    <div className={styles.container}>
      <JournalHeader stats={stats} onNewEntry={() => setShowForm(!showForm)} showForm={showForm} />

      {showForm && <JournalForm {...formHook} />}

      <JournalFilters
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <JournalList entries={entries} onDelete={deleteEntry} loading={loading} />
    </div>
  );
}
```

**Impact**:
- 280 lines → ~50 lines main component
- Each sub-component focused on single responsibility
- Easier testing, maintenance, and reusability

---

### 3.2 ToolForm Refactoring

**Current**: 249 lines, 1 file
**Target**: 6 components, 4 files

#### New Structure:
```
components/tools/
├── ToolForm.tsx               # Main form container (60 lines)
├── ToolBasicFields.tsx        # Name, URL, docs (40 lines)
├── ToolTextFields.tsx         # Description, usage, examples (50 lines)
├── ToolCategorySelector.tsx   # Category multi-select (30 lines)
├── ToolRoleSelector.tsx       # Role multi-select (30 lines)
├── ToolScreenshots.tsx        # Screenshot management (60 lines)
└── components/
    └── ToggleButtonGroup.tsx  # Reusable multi-select (30 lines)
```

**Example: ToolForm.tsx** (Container)
```typescript
export default function ToolForm({ categories, roles, tags, onSaved, initial }: ToolFormProps) {
  const { fileInput, screenshots, addScreenshot, removeScreenshot } = useFileUpload();

  return (
    <Formik
      initialValues={getInitialValues(initial)}
      validate={zodToFormikValidate(ToolCreatePayloadSchema)}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className={styles.form}>
          <ToolBasicFields />
          <ToolTextFields values={values} />
          <ToolCategorySelector categories={categories} selected={values.categories} onChange={(cats) => setFieldValue('categories', cats)} />
          <ToolRoleSelector roles={roles} selected={values.roles} onChange={(roles) => setFieldValue('roles', roles)} />
          <TagMultiSelect value={values.tags} onChange={(tags) => setFieldValue('tags', tags)} />
          <ToolScreenshots screenshots={screenshots} onAdd={addScreenshot} onRemove={removeScreenshot} />

          <FormActions submitting={isSubmitting} />
        </Form>
      )}
    </Formik>
  );
}
```

**Impact**:
- 249 lines → ~60 lines main component
- Reusable ToggleButtonGroup for roles/categories
- Screenshot logic extracted to hook + component

---

### 3.3 Dashboard Page Refactoring

**Current**: 226 lines with inline components
**Target**: 7 components, multiple files

#### New Structure:
```
components/dashboard/
├── DashboardPage.tsx          # Main container (40 lines)
├── WelcomeHeader.tsx          # Title & greeting (20 lines)
├── StatsGrid.tsx              # Stats cards (30 lines)
├── ProfileCard.tsx            # Profile information (40 lines)
├── QuickActionsCard.tsx       # Quick actions list (30 lines)
├── RecentActivityCard.tsx     # Activity timeline (40 lines)
├── RoleDashboardCard.tsx      # Role-specific content (30 lines)
└── components/
    ├── StatCard.tsx           # Individual stat (20 lines)
    ├── ActionButton.tsx       # Quick action button (20 lines)
    └── ActivityItem.tsx       # Activity timeline item (20 lines)
```

**Example: DashboardPage.tsx** (Container)
```typescript
export default function DashboardPage() {
  const { user, loading } = useAuth(true);

  if (loading) return <LoadingPage message="Loading your dashboard..." />;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <WelcomeHeader user={user} />
      <StatsGrid stats={mockStats} />

      <div className={styles.grid}>
        <ProfileCard user={user} />
        <QuickActionsCard />
        <RecentActivityCard activities={mockActivities} />
        <RoleDashboardCard roles={user.roles} />
      </div>

      <JournalSection />
    </div>
  );
}
```

**Impact**:
- Cleaner main component
- Reusable cards and UI elements
- Easier to add/remove dashboard sections

---

### 3.4 Auth Pages Refactoring

**Current**: login.tsx (123 lines), register.tsx (168 lines)
**Target**: Shared AuthForm component

#### New Structure:
```
components/auth/
├── AuthForm.tsx           # Shared form component
├── AuthField.tsx          # Form field wrapper
└── PasswordField.tsx      # Password with "Forgot?" link

pages/
├── login.tsx              # 40 lines (uses AuthForm)
└── register.tsx           # 40 lines (uses AuthForm)
```

**Example: Login page with AuthForm**
```typescript
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await getCsrf();
      await login(values);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <AuthForm
        type="login"
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onErrorClose={() => setError(null)}
      />
    </AuthLayout>
  );
}
```

**Impact**:
- DRY - no duplicated form logic
- Consistent UX across auth pages
- Easier to add new auth methods

---

## Phase 4: Improve Styling (3-4 hours)

### 4.1 CSS Modules Approach

**Current**: Inline styles everywhere
**Target**: CSS Modules per component

#### Example Structure:
```
components/journal/
├── JournalSection.tsx
├── JournalSection.module.css
├── JournalForm.tsx
└── JournalForm.module.css
```

**Benefits**:
- Scoped styles (no conflicts)
- Better performance (no inline style parsing)
- Easier theming
- CSS features (hover, media queries, animations)
- Better separation of concerns

**Example**:
```typescript
// Before (inline)
<div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>

// After (CSS Module)
<div className={styles.container}>
```

```css
/* JournalSection.module.css */
.container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}
```

### 4.2 Design Tokens

**File: `styles/tokens.module.css`**
```css
:root {
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography */
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}
```

**Impact**: Consistent spacing/sizing, easy theming

---

## Phase 5: Error Handling & Performance (2-3 hours)

### 5.1 Error Boundary

**File: `components/ErrorBoundary.tsx`**
```typescript
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Usage**:
```typescript
<ErrorBoundary>
  <DashboardPage />
</ErrorBoundary>
```

### 5.2 Performance Optimizations

1. **Memoize expensive components**:
```typescript
export default React.memo(JournalEntry);
```

2. **Memoize expensive computations**:
```typescript
const filteredEntries = useMemo(() => {
  return entries.filter(/* ... */);
}, [entries, filters]);
```

3. **Stabilize callbacks**:
```typescript
const handleDelete = useCallback((id: number) => {
  // ... logic
}, [/* dependencies */]);
```

---

## Implementation Priority

### Week 1 (Must Have)
1. ✅ Extract constants (journal, dashboard)
2. ✅ Create useJournal hook
3. ✅ Split JournalSection into 5 components
4. ✅ Create CSS modules for Journal

### Week 2 (Should Have)
5. ✅ Create useTool, useFileUpload hooks
6. ✅ Split ToolForm into 6 components
7. ✅ Split Dashboard into 7 components
8. ✅ Add Error Boundary

### Week 3 (Nice to Have)
9. ✅ Refactor Auth pages with shared AuthForm
10. ✅ Add performance optimizations (memo, useMemo)
11. ✅ Improve accessibility (ARIA labels)
12. ✅ Add unit tests for hooks

---

## File Structure (After Refactoring)

```
frontend/
├── components/
│   ├── common/                    # Shared components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   └── ErrorBoundary.tsx
│   ├── dashboard/                 # Dashboard-specific
│   │   ├── DashboardPage.tsx
│   │   ├── WelcomeHeader.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── QuickActionsCard.tsx
│   │   ├── RecentActivityCard.tsx
│   │   └── components/
│   │       ├── StatCard.tsx
│   │       ├── ActionButton.tsx
│   │       └── ActivityItem.tsx
│   ├── journal/                   # Journal-specific
│   │   ├── JournalSection.tsx
│   │   ├── JournalHeader.tsx
│   │   ├── JournalStats.tsx
│   │   ├── JournalForm.tsx
│   │   ├── JournalFilters.tsx
│   │   ├── JournalList.tsx
│   │   ├── JournalEntry.tsx
│   │   └── components/
│   │       ├── MoodSelector.tsx
│   │       ├── TagSelector.tsx
│   │       └── XPSlider.tsx
│   ├── tools/                     # Tool-specific
│   │   ├── ToolForm.tsx
│   │   ├── ToolBasicFields.tsx
│   │   ├── ToolTextFields.tsx
│   │   ├── ToolCategorySelector.tsx
│   │   ├── ToolRoleSelector.tsx
│   │   ├── ToolScreenshots.tsx
│   │   └── components/
│   │       └── ToggleButtonGroup.tsx
│   └── auth/                      # Auth-specific
│       ├── AuthForm.tsx
│       ├── AuthField.tsx
│       └── PasswordField.tsx
├── hooks/
│   ├── useAuth.ts                 # Existing
│   ├── useForm.ts                 # Existing
│   ├── useAsync.ts                # Existing
│   ├── useJournal.ts              # NEW
│   ├── useJournalForm.ts          # NEW
│   ├── useTool.ts                 # NEW
│   ├── useFileUpload.ts           # NEW
│   └── useFilters.ts              # NEW
├── lib/
│   ├── constants/
│   │   ├── index.ts               # Re-exports
│   │   ├── journal.ts             # NEW
│   │   ├── dashboard.ts           # NEW
│   │   └── tools.ts               # NEW
│   ├── api.ts
│   ├── types.ts
│   ├── schemas.ts
│   └── utils.ts
└── styles/
    ├── globals.css
    ├── tokens.module.css          # NEW - Design tokens
    └── components/                # CSS Modules
        ├── JournalSection.module.css
        ├── DashboardPage.module.css
        └── ...
```

---

## Benefits Summary

### Code Quality
- ✅ **80% reduction** in component size (280 → 50 lines)
- ✅ **Single Responsibility** - each component does one thing
- ✅ **DRY** - no duplicated logic
- ✅ **Type-safe** - better TypeScript usage
- ✅ **Testable** - isolated units

### Maintainability
- ✅ **Easier debugging** - smaller components
- ✅ **Faster onboarding** - clearer structure
- ✅ **Simpler updates** - change one component
- ✅ **Better Git diffs** - smaller, focused commits

### Performance
- ✅ **Faster re-renders** - React.memo prevents unnecessary updates
- ✅ **Better code splitting** - smaller bundles
- ✅ **Optimized computations** - useMemo/useCallback

### Developer Experience
- ✅ **Easier to read** - less cognitive load
- ✅ **Faster development** - reusable components/hooks
- ✅ **Better tooling** - CSS modules autocomplete
- ✅ **Consistent patterns** - clear conventions

---

## Migration Strategy

### Step 1: Create New Files (Non-Breaking)
- Add new hooks, components, constants
- Don't touch existing code yet
- Write tests for new code

### Step 2: Gradual Migration (Feature by Feature)
- Migrate Journal section first (most benefit)
- Then Dashboard
- Then Tools
- Finally Auth pages

### Step 3: Cleanup
- Remove old components
- Update imports
- Remove unused code
- Update documentation

### Step 4: Polish
- Add performance optimizations
- Improve accessibility
- Add tests
- Update storybook (if applicable)

---

## Testing Strategy

### Unit Tests (Hooks)
```typescript
describe('useJournal', () => {
  it('should load entries on mount', async () => {
    const { result } = renderHook(() => useJournal({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toBeDefined();
  });
});
```

### Component Tests
```typescript
describe('JournalForm', () => {
  it('should validate required fields', async () => {
    render(<JournalForm onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByText('Save Entry'));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
```

---

## Risks & Mitigation

### Risk: Breaking Changes
**Mitigation**:
- Gradual migration
- Keep old components until fully tested
- Feature flags if needed

### Risk: Performance Regression
**Mitigation**:
- Benchmark before/after
- Use React DevTools Profiler
- Add performance budgets

### Risk: Increased Complexity
**Mitigation**:
- Clear folder structure
- Good documentation
- Consistent naming conventions

---

## Success Metrics

### Code Metrics
- [ ] Average component size: < 100 lines
- [ ] Maximum component size: < 150 lines
- [ ] Code duplication: < 5%
- [ ] Test coverage: > 70%

### Performance Metrics
- [ ] Lighthouse score: > 90
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3s
- [ ] Bundle size: < 200KB gzipped

### Developer Metrics
- [ ] New feature time: -30%
- [ ] Bug fix time: -40%
- [ ] Code review time: -25%

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏳ Create GitHub issues for each phase
3. ⏳ Set up project board
4. ⏳ Start with Phase 1 (Quick wins)
5. ⏳ Weekly progress reviews

**Estimated Total Time**: 20-30 hours
**Expected Completion**: 3 weeks

---

## Questions & Answers

**Q: Should we use Tailwind CSS instead of CSS Modules?**
A: CSS Modules are better for this project because:
- Already using CSS variables for theming
- No build step changes needed
- More familiar to team
- Better for component-scoped styles

**Q: What about Styled Components?**
A: Not recommended because:
- Runtime cost
- Larger bundle size
- CSS Modules achieve same goals with zero runtime

**Q: Should we use Context API for shared state?**
A: Not yet. Current approach with hooks is sufficient. Consider Context if:
- Prop drilling becomes painful (> 3 levels)
- Same data needed in many unrelated components
- Global UI state (theme, user) needs sharing

**Q: What about TypeScript strict mode?**
A: Good idea! Enable incrementally:
- `strict: true` in tsconfig.json
- Fix errors file by file
- Prevents future bugs

---

**Document Version**: 1.0
**Last Updated**: 2025-12-11
**Author**: AI Vibecoding Academy
**Status**: Ready for Review

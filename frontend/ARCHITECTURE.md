# Frontend Architecture Guide

**Last Updated**: 2025-12-12
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Architecture Patterns](#architecture-patterns)
4. [Component Organization](#component-organization)
5. [State Management](#state-management)
6. [Type System](#type-system)
7. [Styling Approach](#styling-approach)
8. [Best Practices](#best-practices)

---

## Overview

This Next.js application follows a **feature-based architecture** with clear separation of concerns. The codebase is organized into modular components, reusable hooks, and centralized constants.

### **Tech Stack**

- **Framework**: Next.js 15.5.7
- **UI Library**: React 19
- **Language**: TypeScript 5.x
- **Styling**: Inline styles (CSS Modules planned)
- **Forms**: Formik + Zod validation
- **Data Fetching**: Custom hooks + React Query
- **State**: React hooks (useState, useContext)

### **Architecture Principles**

1. **Feature-Based Organization**: Components grouped by feature
2. **Separation of Concerns**: UI, logic, and data are separated
3. **Composition over Inheritance**: Build complex UIs from simple components
4. **Type Safety**: Full TypeScript coverage
5. **DRY Principle**: Reusable hooks, components, and constants

---

## Directory Structure

```
frontend/
├── app/                        # Next.js 15 app directory
│   └── globals.css            # Global styles
├── components/                 # React components
│   ├── common/                # Shared UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Loading.tsx
│   ├── journal/               # Journal feature module
│   │   ├── JournalSection.tsx
│   │   ├── JournalHeader.tsx
│   │   ├── JournalStats.tsx
│   │   ├── JournalForm.tsx
│   │   ├── JournalFilters.tsx
│   │   ├── JournalList.tsx
│   │   └── components/
│   │       ├── MoodSelector.tsx
│   │       ├── TagSelector.tsx
│   │       └── XPSlider.tsx
│   ├── dashboard/             # Dashboard feature module
│   │   ├── WelcomeHeader.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── QuickActions.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── RoleCard.tsx
│   └── tools/                 # Tools feature module
│       ├── NameField.tsx
│       ├── URLFields.tsx
│       ├── TextAreaField.tsx
│       ├── RoleSelector.tsx
│       ├── CategorySelector.tsx
│       └── ScreenshotManager.tsx
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useJournal.ts         # Journal data management
│   ├── useFilters.ts         # Filter state management
│   └── useFileUpload.ts      # File upload handling
├── lib/                       # Utilities and helpers
│   ├── api.ts                # API client functions
│   ├── types.ts              # Shared TypeScript types
│   ├── schemas.ts            # Zod validation schemas
│   ├── formikZod.ts          # Formik-Zod adapter
│   └── constants/            # Configuration constants
│       ├── index.ts          # Barrel exports
│       ├── journal.ts        # Journal configuration
│       └── dashboard.ts      # Dashboard configuration
├── pages/                     # Next.js pages (Pages Router)
│   ├── _app.tsx              # App wrapper
│   ├── index.tsx             # Homepage
│   ├── dashboard.tsx         # Dashboard page
│   ├── login.tsx             # Login page
│   └── admin/                # Admin pages
│       └── users/
│           └── [id].tsx      # User detail page
└── public/                    # Static assets
    └── images/
```

---

## Architecture Patterns

### **1. Feature Module Pattern**

Components are organized by feature, not by type:

```
✅ GOOD: Feature-based
components/
├── journal/              # All journal-related components
├── dashboard/            # All dashboard-related components
└── tools/                # All tools-related components

❌ BAD: Type-based
components/
├── headers/              # Scattered across features
├── forms/                # Hard to find related code
└── cards/                # Mixed concerns
```

**Benefits:**
- Easy to locate feature code
- Clear boundaries between features
- Supports code splitting by feature
- Easier to onboard new developers

### **2. Container/Presentational Pattern**

Components are split into containers (smart) and presentational (dumb):

**Container Components:**
```typescript
// components/journal/JournalSection.tsx
export default function JournalSection() {
  // Data fetching, state management, business logic
  const { entries, loading, createEntry } = useJournal(filters);

  // Orchestrates presentational components
  return (
    <div>
      <JournalHeader />
      <JournalStats stats={stats} />
      <JournalForm onSubmit={createEntry} />
      <JournalList entries={entries} loading={loading} />
    </div>
  );
}
```

**Presentational Components:**
```typescript
// components/journal/JournalHeader.tsx
export default function JournalHeader({ onNewEntry, showForm }) {
  // Pure UI, no business logic
  return (
    <div>
      <h2>Adventure Journal</h2>
      <button onClick={onNewEntry}>
        {showForm ? 'Cancel' : 'New Entry'}
      </button>
    </div>
  );
}
```

### **3. Custom Hook Pattern**

Complex logic is extracted into reusable hooks:

```typescript
// hooks/useJournal.ts
export function useJournal(filters, autoLoad = true) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await getJournalEntries(filters);
    setEntries(data);
  }, [filters]);

  const createEntry = useCallback(async (payload) => {
    const newEntry = await createJournalEntry(payload);
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, []);

  useEffect(() => {
    if (autoLoad) loadData();
  }, [autoLoad, loadData]);

  return { entries, loading, loadData, createEntry, deleteEntry };
}
```

**Usage in Component:**
```typescript
function JournalSection() {
  const { entries, loading, createEntry } = useJournal({ mood: 'happy' });
  // Component focused on rendering, hook handles logic
}
```

### **4. Constants Pattern**

Configuration is centralized with type safety:

```typescript
// lib/constants/journal.ts
export const MOOD_OPTIONS = [
  { value: 'excited', emoji: '🚀', label: 'Excited', color: '#f59e0b' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
  // ...
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];
// Type: 'excited' | 'happy' | ...
```

**Benefits:**
- Single source of truth
- Type-safe configuration
- Easy to update
- Prevents typos

---

## Component Organization

### **Component Size Guidelines**

| Component Type | Max Lines | Typical Lines | Example |
|---------------|-----------|---------------|---------|
| **Page Component** | 100 | 40-60 | `pages/dashboard.tsx` |
| **Feature Container** | 120 | 80-100 | `JournalSection.tsx` |
| **Sub-Component** | 80 | 40-60 | `JournalForm.tsx` |
| **Small Component** | 50 | 20-40 | `JournalHeader.tsx` |
| **Micro Component** | 30 | 15-25 | `MoodSelector.tsx` |

### **Component Naming Conventions**

```typescript
// ✅ GOOD: Clear, descriptive names
JournalSection.tsx       // Feature container
JournalForm.tsx         // Sub-component
MoodSelector.tsx        // Small component

// ❌ BAD: Vague or too generic
Section.tsx             // What section?
Form.tsx                // What form?
Selector.tsx            // What selector?
```

### **Component Structure Template**

```typescript
/**
 * ComponentName Component
 * Brief description of what it does
 */

import React from 'react';
import { SomeType } from '../lib/types';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  onAction: () => void;
}

export default function ComponentName({
  prop1,
  prop2 = 0,
  onAction
}: ComponentNameProps): React.ReactElement {
  // Hooks first
  const [state, setState] = useState();

  // Event handlers
  const handleAction = () => {
    // ...
  };

  // Early returns
  if (!prop1) return null;

  // Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

---

## State Management

### **State Hierarchy**

1. **Local State** (`useState`)
   - Form inputs
   - UI toggles (modals, dropdowns)
   - Temporary data

2. **Custom Hooks** (`useJournal`, `useAuth`)
   - Feature-specific state
   - Data fetching
   - Business logic

3. **Context** (`useAuth`)
   - Global user authentication
   - Theme settings
   - Shared configuration

4. **URL State** (Next.js router)
   - Current page
   - Query parameters
   - Route params

### **State Management Guidelines**

```typescript
// ✅ GOOD: Local state for UI
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return <>{isOpen && <ModalContent />}</>;
}

// ✅ GOOD: Custom hook for feature state
function JournalPage() {
  const { entries, createEntry } = useJournal();
  return <JournalList entries={entries} />;
}

// ✅ GOOD: Context for global state
function App() {
  const { user, logout } = useAuth();
  return <>{user ? <Dashboard /> : <Login />}</>;
}

// ❌ BAD: Prop drilling through many levels
function App() {
  const [user, setUser] = useState();
  return <Layout user={user}>
    <Header user={user}>
      <UserMenu user={user} />  {/* Too deep! */}
    </Header>
  </Layout>;
}
```

---

## Type System

### **Type Organization**

```typescript
// lib/types.ts - Global types
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: MoodValue;
  tags: string[];
  xp: number;
}

// Component-specific types in component file
interface JournalFormProps {
  onSubmit: (data: JournalCreatePayload) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error: string;
}
```

### **Type Inference from Constants**

```typescript
// lib/constants/journal.ts
export const MOOD_OPTIONS = [
  { value: 'excited', emoji: '🚀', label: 'Excited' },
  // ...
] as const;

// Inferred types
export type MoodOption = typeof MOOD_OPTIONS[number];
// { value: string; emoji: string; label: string }

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];
// 'excited' | 'happy' | 'neutral' | ...
```

### **Type Safety Best Practices**

```typescript
// ✅ GOOD: Strict types
interface Props {
  status: 'pending' | 'completed' | 'failed';  // Union type
  count: number;  // Specific type
  onSave: (data: FormData) => void;  // Function signature
}

// ❌ BAD: Loose types
interface Props {
  status: string;  // Too broad
  count: any;  // No type safety
  onSave: Function;  // No signature
}
```

---

## Styling Approach

### **Current: Inline Styles**

```typescript
<div style={{
  padding: 32,
  maxWidth: 1200,
  margin: '0 auto',
  background: 'var(--bg-primary)'
}}>
```

**Pros:**
- Scoped to component
- No CSS file needed
- Dynamic values easy

**Cons:**
- No pseudo-selectors (`:hover`)
- No media queries
- Verbose for complex styles

### **Future: CSS Modules** (Planned)

```typescript
// Component.module.css
.container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-primary);
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}

// Component.tsx
import styles from './Component.module.css';

<div className={styles.container}>
```

### **CSS Variables**

Global design tokens defined in `app/globals.css`:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --accent-primary: #3b82f6;
  --border-color: #e5e7eb;
  --border-hover: #d1d5db;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
  /* ... */
}
```

---

## Best Practices

### **1. Component Design**

✅ **DO:**
- Keep components under 100 lines
- One component, one responsibility
- Use TypeScript interfaces for props
- Extract complex logic to hooks
- Use descriptive names

❌ **DON'T:**
- Mix data fetching with UI
- Hardcode configuration
- Create god components
- Use generic names
- Skip type definitions

### **2. Custom Hooks**

✅ **DO:**
```typescript
// Extract complex logic
function useJournal(filters) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getJournalEntries(filters);
    setEntries(data);
    setLoading(false);
  }, [filters]);

  return { entries, loading, loadData };
}
```

❌ **DON'T:**
```typescript
// Keep all logic in component
function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // ... 50 more lines of logic
}
```

### **3. Constants**

✅ **DO:**
```typescript
// lib/constants/journal.ts
export const MOOD_OPTIONS = [...] as const;
export const TAG_OPTIONS = [...] as const;

// Component
import { MOOD_OPTIONS } from '../lib/constants';
```

❌ **DON'T:**
```typescript
// Component
const MOOD_OPTIONS = [...];  // Duplicated everywhere
```

### **4. File Organization**

✅ **DO:**
```
components/journal/
├── JournalSection.tsx       # Container
├── JournalForm.tsx          # Sub-component
└── components/              # Small components
    └── MoodSelector.tsx
```

❌ **DON'T:**
```
components/
├── Journal.tsx              # All in one file
```

### **5. Import Organization**

```typescript
// ✅ GOOD: Organized imports
import React, { useState, useCallback } from 'react';  // React first
import { useRouter } from 'next/router';               // Framework
import Card from '../components/Card';                 // Internal
import { User } from '../lib/types';                   // Types
import { CONSTANTS } from '../lib/constants';          // Constants

// ❌ BAD: Random order
import { CONSTANTS } from '../lib/constants';
import React from 'react';
import Card from '../components/Card';
```

---

## Common Patterns

### **Data Fetching Pattern**

```typescript
// 1. Create custom hook
export function useJournal(filters) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getJournalEntries(filters);
    setData(result);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, loadData };
}

// 2. Use in component
function JournalPage() {
  const { data, loading } = useJournal({ mood: 'happy' });

  if (loading) return <Loading />;
  return <JournalList entries={data} />;
}
```

### **Form Handling Pattern**

```typescript
// With Formik
<Formik
  initialValues={{ name: '', email: '' }}
  validate={zodToFormikValidate(schema)}
  onSubmit={async (values) => {
    await createUser(values);
  }}
>
  {({ isSubmitting }) => (
    <Form>
      <Field name="name" />
      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </Form>
  )}
</Formik>
```

### **Conditional Rendering Pattern**

```typescript
// ✅ GOOD: Early returns
function UserProfile({ user }) {
  if (!user) return <Login />;
  if (user.loading) return <Loading />;
  if (user.error) return <Error message={user.error} />;

  return <ProfileContent user={user} />;
}

// ❌ BAD: Nested ternaries
function UserProfile({ user }) {
  return user ? (
    user.loading ? <Loading /> : (
      user.error ? <Error /> : <ProfileContent />
    )
  ) : <Login />;
}
```

---

## Next Steps

1. **Continue Refactoring**: Apply patterns to remaining pages
2. **Add CSS Modules**: Migrate from inline styles
3. **Write Tests**: Unit tests for hooks and components
4. **Performance**: Add React.memo where appropriate
5. **Documentation**: Document new components in Storybook

---

**Questions?** See [COMPONENT_REFACTORING_COMPLETE.md](../COMPONENT_REFACTORING_COMPLETE.md) for implementation details.

# Frontend Refactoring Implementation Guide

Complete code examples showing before/after for each major refactoring.

---

## Table of Contents
1. [JournalSection Refactoring](#1-journalsection-refactoring)
2. [Dashboard Page Refactoring](#2-dashboard-page-refactoring)
3. [ToolForm Refactoring](#3-toolform-refactoring)
4. [Custom Hooks Examples](#4-custom-hooks-examples)
5. [CSS Modules Migration](#5-css-modules-migration)
6. [Performance Optimizations](#6-performance-optimizations)

---

## 1. JournalSection Refactoring

### BEFORE: Monolithic Component (280 lines)

```typescript
// components/JournalSection.tsx (BEFORE)
export default function JournalSection(): React.ReactElement {
  const [entries, setEntries] = useState<JournalEntryModel[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '', mood: 'neutral', tags: [] as string[], xp: 50 });
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    // 50+ lines of data fetching logic
  }, [search, moodFilter, tagFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    // 30+ lines of form submission logic
  };

  const handleDelete = async (id: number | string) => {
    // Delete logic
  };

  return (
    <div>
      {/* 150+ lines of JSX with inline components */}
      <form onSubmit={handleSubmit}>
        {/* Massive form with inline styles */}
      </form>
      {/* More inline components */}
    </div>
  );
}
```

### AFTER: Modular Architecture

#### Step 1: Extract Constants

```typescript
// lib/constants/journal.ts (NEW)
export const MOOD_OPTIONS = [
  { value: 'excited', emoji: '🚀', label: 'Excited', color: '#f59e0b' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: '#8b5cf6' },
  { value: 'victorious', emoji: '🏆', label: 'Victorious', color: '#ef4444' }
] as const;

export const TAG_OPTIONS = [
  'Backend', 'Frontend', 'Bug Fix', 'Feature Quest', 'Refactor',
  'Docs', 'Testing', 'Design', 'Learning', 'Team Collab'
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];
export type TagValue = typeof TAG_OPTIONS[number];
```

#### Step 2: Create Custom Hook

```typescript
// hooks/useJournal.ts (NEW)
import { useState, useCallback } from 'react';
import { getJournalEntries, createJournalEntry, deleteJournalEntry, getJournalStats } from '../lib/api';
import type { JournalEntry, JournalStats, JournalCreatePayload } from '../lib/types';

export interface JournalFilters {
  search?: string;
  mood?: string;
  tag?: string;
}

export function useJournal(filters: JournalFilters = {}) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean> = {};
      if (filters.search) params.search = filters.search;
      if (filters.mood) params.mood = filters.mood;
      if (filters.tag) params.tag = filters.tag;

      const [entriesData, statsData] = await Promise.all([
        getJournalEntries(params),
        getJournalStats()
      ]);

      setEntries(entriesData || []);
      setStats(statsData || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal data');
      console.error('Failed to load journal data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.mood, filters.tag]);

  const createEntry = useCallback(async (data: JournalCreatePayload): Promise<JournalEntry | null> => {
    try {
      const newEntry = await createJournalEntry(data);
      if (newEntry) {
        setEntries(prev => [newEntry, ...prev]);
        // Reload to get updated stats
        loadData();
      }
      return newEntry;
    } catch (err) {
      throw err;
    }
  }, [loadData]);

  const deleteEntry = useCallback(async (id: number | string): Promise<void> => {
    try {
      await deleteJournalEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      // Reload to get updated stats
      loadData();
    } catch (err) {
      throw err;
    }
  }, [loadData]);

  return {
    entries,
    stats,
    loading,
    error,
    loadData,
    createEntry,
    deleteEntry
  };
}
```

#### Step 3: Create Filter Hook

```typescript
// hooks/useFilters.ts (NEW)
import { useState, useCallback, useMemo } from 'react';

export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      return value !== '' && value !== null && value !== undefined;
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
}
```

#### Step 4: Split Into Components

```typescript
// components/journal/JournalSection.tsx (AFTER - Main Container)
import React, { useState, useEffect } from 'react';
import { useJournal } from '../../hooks/useJournal';
import { useFilters } from '../../hooks/useFilters';
import JournalHeader from './JournalHeader';
import JournalStats from './JournalStats';
import JournalForm from './JournalForm';
import JournalFilters from './JournalFilters';
import JournalList from './JournalList';
import { LoadingPage } from '../Loading';
import styles from './JournalSection.module.css';

interface JournalFilters {
  search: string;
  mood: string;
  tag: string;
}

const initialFilters: JournalFilters = {
  search: '',
  mood: '',
  tag: ''
};

export default function JournalSection(): React.ReactElement {
  const [showForm, setShowForm] = useState(false);
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useFilters(initialFilters);
  const { entries, stats, loading, error, loadData, createEntry, deleteEntry } = useJournal(filters);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateEntry = async (data: JournalCreatePayload) => {
    await createEntry(data);
    setShowForm(false);
  };

  if (loading && !stats) {
    return <LoadingPage message="Loading your adventure journal..." />;
  }

  return (
    <div className={styles.container}>
      <JournalHeader
        stats={stats}
        onNewEntry={() => setShowForm(!showForm)}
        showForm={showForm}
      />

      <JournalStats stats={stats} />

      {showForm && (
        <JournalForm
          onSubmit={handleCreateEntry}
          onCancel={() => setShowForm(false)}
        />
      )}

      <JournalFilters
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <JournalList
        entries={entries}
        onDelete={deleteEntry}
        loading={loading}
        hasFilters={hasActiveFilters}
      />
    </div>
  );
}
```

```typescript
// components/journal/JournalHeader.tsx (NEW)
import React from 'react';
import type { JournalStats } from '../../lib/types';
import styles from './JournalHeader.module.css';

interface JournalHeaderProps {
  stats: JournalStats | null;
  onNewEntry: () => void;
  showForm: boolean;
}

export default function JournalHeader({ stats, onNewEntry, showForm }: JournalHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h2 className={styles.title}>
          📖 Adventure Journal
        </h2>
        <p className={styles.subtitle}>
          Track your coding journey and earn XP!
        </p>
      </div>

      <button
        onClick={onNewEntry}
        className={showForm ? styles.cancelButton : styles.newEntryButton}
      >
        <span className={styles.buttonIcon}>
          {showForm ? '✖️' : '✨'}
        </span>
        {showForm ? 'Cancel' : 'New Entry'}
      </button>
    </div>
  );
}
```

```typescript
// components/journal/JournalStats.tsx (NEW)
import React from 'react';
import type { JournalStats as JournalStatsType } from '../../lib/types';
import styles from './JournalStats.module.css';

interface JournalStatsProps {
  stats: JournalStatsType | null;
}

export default function JournalStats({ stats }: JournalStatsProps) {
  if (!stats) return null;

  return (
    <div className={styles.statsGrid}>
      <StatItem icon="📚" label="Total Entries" value={stats.total_entries} color="#3b82f6" />
      <StatItem icon="⭐" label="Total XP" value={stats.total_xp} color="#f59e0b" />
      <StatItem icon="📅" label="This Week" value={stats.entries_this_week} color="#10b981" />
      <StatItem icon="🔥" label="Streak" value={`${stats.recent_streak} days`} color="#ef4444" />
    </div>
  );
}

interface StatItemProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  return (
    <div className={styles.statItem}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
```

```typescript
// components/journal/JournalForm.tsx (NEW)
import React, { useState } from 'react';
import { MoodSelector } from './components/MoodSelector';
import { TagSelector } from './components/TagSelector';
import { XPSlider } from './components/XPSlider';
import type { JournalCreatePayload } from '../../lib/types';
import styles from './JournalForm.module.css';

interface JournalFormProps {
  onSubmit: (data: JournalCreatePayload) => Promise<void>;
  onCancel: () => void;
}

const initialFormData = {
  title: '',
  content: '',
  mood: 'neutral' as const,
  tags: [] as string[],
  xp: 50
};

export default function JournalForm({ onSubmit, onCancel }: JournalFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Content is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData(initialFormData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create entry';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.formTitle}>✨ Record Your Adventure</h3>

      {formError && (
        <div className={styles.error}>{formError}</div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="What did you accomplish today?"
          className={styles.input}
          disabled={submitting}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Content *</label>
        <textarea
          value={formData.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Describe your journey in detail..."
          rows={6}
          className={styles.textarea}
          disabled={submitting}
        />
      </div>

      <MoodSelector
        value={formData.mood}
        onChange={(mood) => updateField('mood', mood)}
        disabled={submitting}
      />

      <TagSelector
        selected={formData.tags}
        onToggle={toggleTag}
        disabled={submitting}
      />

      <XPSlider
        value={formData.xp}
        onChange={(xp) => updateField('xp', xp)}
        disabled={submitting}
      />

      <div className={styles.actions}>
        <button type="submit" disabled={submitting} className={styles.submitButton}>
          {submitting ? '⏳ Saving...' : '🚀 Save Entry'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButtonSecondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}
```

```typescript
// components/journal/components/MoodSelector.tsx (NEW)
import React from 'react';
import { MOOD_OPTIONS } from '../../../lib/constants/journal';
import type { MoodValue } from '../../../lib/constants/journal';
import styles from './MoodSelector.module.css';

interface MoodSelectorProps {
  value: string;
  onChange: (mood: string) => void;
  disabled?: boolean;
}

export function MoodSelector({ value, onChange, disabled }: MoodSelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>How are you feeling? *</label>
      <div className={styles.moodGrid}>
        {MOOD_OPTIONS.map(mood => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            disabled={disabled}
            className={value === mood.value ? styles.moodButtonActive : styles.moodButton}
            style={{
              '--mood-color': mood.color
            } as React.CSSProperties}
          >
            <span className={styles.moodEmoji}>{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Result: Component Size Comparison

| Component | Before | After |
|-----------|--------|-------|
| JournalSection | 280 lines | 50 lines |
| JournalHeader | (inline) | 30 lines |
| JournalStats | (inline) | 40 lines |
| JournalForm | (inline) | 80 lines |
| JournalFilters | (inline) | 50 lines |
| MoodSelector | (inline) | 30 lines |
| TagSelector | (inline) | 30 lines |
| XPSlider | (inline) | 20 lines |

**Total Benefit**: One 280-line monolith → Eight focused components averaging 40 lines each

---

## 2. Dashboard Page Refactoring

### BEFORE: Mixed Concerns (226 lines)

```typescript
// pages/dashboard.tsx (BEFORE)
export default function DashboardPage(): React.ReactElement | null {
  const { user, loading } = useAuth(true);

  if (loading) return <LoadingPage message="Loading your dashboard..." />;
  if (!user) return null;

  const roleColors: Record<string, BadgeVariant> = {
    owner: 'error',
    backend: 'primary',
    // ... hardcoded config
  };

  const stats = [
    { label: 'Active Projects', value: 8, icon: '📁', color: '#3b82f6' },
    // ... hardcoded data
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* 150+ lines of inline JSX */}
      {/* Inline ActionButton component */}
      {/* Inline ActivityItem component */}
      {/* Inline helper functions */}
    </div>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  // 30 lines of inline component
}
```

### AFTER: Modular Architecture

#### Step 1: Extract Constants

```typescript
// lib/constants/dashboard.ts (NEW)
import type { BadgeVariant } from '../types';

export const ROLE_COLORS: Record<string, BadgeVariant> = {
  owner: 'error',
  backend: 'primary',
  frontend: 'success',
  pm: 'purple',
  qa: 'warning',
  designer: 'purple'
} as const;

export const ROLE_TITLES: Record<string, string> = {
  owner: 'Admin Dashboard',
  backend: 'Backend Tasks',
  frontend: 'Frontend Tasks',
  pm: 'Project Management',
  qa: 'Quality Assurance',
  designer: 'Design Tasks'
} as const;

export const ROLE_CONTENT: Record<string, string> = {
  owner: 'You have full system access. Monitor team activity, manage users, and configure system settings.',
  backend: 'Focus on API development, database optimization, and server infrastructure. 3 pending code reviews.',
  frontend: 'Work on UI components, responsive design, and user experience improvements. 5 features in progress.',
  pm: 'Oversee project timelines, coordinate team efforts, and ensure deliverables meet requirements. 2 projects need updates.',
  qa: 'Review test cases, report bugs, and ensure quality standards. 7 issues awaiting verification.',
  designer: 'Create mockups, refine UI/UX, and maintain design systems. 4 design reviews scheduled.'
} as const;

export interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export const MOCK_STATS: DashboardStat[] = [
  { label: 'Active Projects', value: 8, icon: '📁', color: '#3b82f6' },
  { label: 'Tasks Completed', value: 42, icon: '✓', color: '#10b981' },
  { label: 'Team Members', value: 15, icon: '👥', color: '#8b5cf6' },
];

export interface Activity {
  icon: string;
  text: string;
  time: string;
  color: string;
}

export const MOCK_ACTIVITIES: Activity[] = [
  { icon: '✓', text: 'Completed task: Update documentation', time: '2 hours ago', color: '#10b981' },
  { icon: '💬', text: 'New comment on Design Review', time: '5 hours ago', color: '#3b82f6' },
  { icon: '📁', text: 'Created project: Mobile App v2', time: 'Yesterday', color: '#8b5cf6' },
];
```

#### Step 2: Create Reusable Components

```typescript
// components/dashboard/DashboardPage.tsx (AFTER - Container)
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingPage } from '../Loading';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid';
import ProfileCard from './ProfileCard';
import QuickActionsCard from './QuickActionsCard';
import RecentActivityCard from './RecentActivityCard';
import RoleDashboardCard from './RoleDashboardCard';
import JournalSection from '../journal/JournalSection';
import { MOCK_STATS, MOCK_ACTIVITIES } from '../../lib/constants/dashboard';
import styles from './DashboardPage.module.css';

export default function DashboardPage(): React.ReactElement | null {
  const { user, loading } = useAuth(true);

  if (loading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  if (!user) return null;

  return (
    <div className={styles.container}>
      <WelcomeHeader user={user} />

      <StatsGrid stats={MOCK_STATS} />

      <div className={styles.grid}>
        <ProfileCard user={user} />
        <QuickActionsCard />
        <RecentActivityCard activities={MOCK_ACTIVITIES} />
        <RoleDashboardCard roles={user.roles} />
      </div>

      <JournalSection />
    </div>
  );
}
```

```typescript
// components/dashboard/StatsGrid.tsx (NEW)
import React from 'react';
import StatCard from './components/StatCard';
import type { DashboardStat } from '../../lib/constants/dashboard';
import styles from './StatsGrid.module.css';

interface StatsGridProps {
  stats: DashboardStat[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className={styles.grid}>
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
```

```typescript
// components/dashboard/components/StatCard.tsx (NEW)
import React from 'react';
import Card from '../../Card';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.label}>{label}</div>
          <div className={styles.value}>{value}</div>
        </div>
        <div
          className={styles.iconContainer}
          style={{ backgroundColor: `${color}15` }}
        >
          <span className={styles.icon}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}
```

```typescript
// components/dashboard/ProfileCard.tsx (NEW)
import React from 'react';
import Card from '../Card';
import Badge from '../Badge';
import type { User } from '../../lib/types';
import { ROLE_COLORS } from '../../lib/constants/dashboard';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card title="Profile Information">
      <div className={styles.container}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Name</div>
          <div className={styles.fieldValue}>{user.name}</div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>Email</div>
          <div className={styles.fieldValue}>{user.email}</div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>Roles</div>
          <div className={styles.rolesContainer}>
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((roleName: string) => (
                <Badge
                  key={roleName}
                  variant={ROLE_COLORS[roleName] || 'default'}
                >
                  {roleName}
                </Badge>
              ))
            ) : (
              <span className={styles.noRoles}>No roles assigned</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### Result: Better Organization

**Before**:
- 1 file, 226 lines
- Inline components
- Hardcoded data mixed with logic
- Difficult to test

**After**:
- 10 files, average 30 lines each
- Reusable components
- Constants separated
- Easy to test individual pieces

---

## 3. ToolForm Refactoring

### Key Improvement: Extract Screenshot Logic

```typescript
// hooks/useFileUpload.ts (NEW)
import { useState, useRef, useCallback } from 'react';

export function useFileUpload(maxFiles: number = 10) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setFiles(prev => [...prev, ...fileArray]);

    // Generate previews
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [files.length, maxFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const uploadFiles = useCallback(async (
    uploadFn: (files: File[]) => Promise<void>
  ) => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      await uploadFn(files);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [files, reset]);

  return {
    fileInputRef,
    files,
    previews,
    uploading,
    error,
    handleFileSelect,
    removeFile,
    reset,
    uploadFiles
  };
}
```

**Usage in ToolForm**:
```typescript
export default function ToolForm({ onSaved }: ToolFormProps) {
  const { fileInputRef, previews, handleFileSelect, removeFile, uploadFiles } = useFileUpload();

  const handleSubmit = async (values) => {
    // Save tool first
    const tool = await createTool(values);

    // Then upload screenshots
    await uploadFiles(async (files) => {
      await uploadToolScreenshots(tool.id, files);
    });

    onSaved(tool);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other fields ... */}

      <ToolScreenshots
        previews={previews}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onRemove={removeFile}
      />
    </form>
  );
}
```

---

## 4. Custom Hooks Examples

### useAsync Hook (NEW)

```typescript
// hooks/useAsync.ts
import { useState, useCallback } from 'react';

export function useAsync<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
}
```

**Usage**:
```typescript
function MyComponent() {
  const { loading, error, data, execute } = useAsync(fetchUserData);

  useEffect(() => {
    execute(userId);
  }, [userId, execute]);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  return <UserProfile data={data} />;
}
```

---

## 5. CSS Modules Migration

### Before: Inline Styles

```typescript
<div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
  <button style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    cursor: 'pointer'
  }}>
    Click me
  </button>
</div>
```

### After: CSS Modules

```typescript
// Component
import styles from './MyComponent.module.css';

<div className={styles.container}>
  <button className={styles.button}>
    Click me
  </button>
</div>
```

```css
/* MyComponent.module.css */
.container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.button:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .button {
    width: 100%;
    justify-content: center;
  }
}
```

**Benefits**:
- Hover/active states easy
- Media queries built-in
- Better performance
- Autocomplete in VSCode
- No JavaScript overhead

---

## 6. Performance Optimizations

### React.memo for Expensive Components

```typescript
// BEFORE
export default function ExpensiveComponent({ data }: Props) {
  // ... expensive rendering logic
}

// AFTER
export default React.memo(ExpensiveComponent, (prevProps, nextProps) => {
  // Custom comparison (optional)
  return prevProps.data.id === nextProps.data.id;
});
```

### useMemo for Expensive Computations

```typescript
// BEFORE
function JournalList({ entries, filters }: Props) {
  const filteredEntries = entries.filter(entry => {
    // ... complex filtering logic
  });

  return <div>{filteredEntries.map(...)}</div>;
}

// AFTER
function JournalList({ entries, filters }: Props) {
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // ... complex filtering logic
    });
  }, [entries, filters]); // Only recompute when these change

  return <div>{filteredEntries.map(...)}</div>;
}
```

### useCallback for Stable Callbacks

```typescript
// BEFORE
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Clicked');
  };

  return <Child onClick={handleClick} />;
  // Child re-renders on every Parent render (new function reference)
}

// AFTER
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Stable reference

  return <Child onClick={handleClick} />;
  // Child only re-renders when necessary
}
```

---

## Implementation Checklist

### Phase 1: Quick Wins (Week 1)
- [ ] Extract constants (journal, dashboard, tools)
- [ ] Create useJournal hook
- [ ] Create useFilters hook
- [ ] Create JournalHeader component
- [ ] Create JournalStats component
- [ ] Create CSS module for JournalSection

### Phase 2: Major Refactors (Week 2)
- [ ] Complete JournalSection refactor
- [ ] Create useFileUpload hook
- [ ] Split ToolForm component
- [ ] Split Dashboard components
- [ ] Create CSS modules for all components

### Phase 3: Polish (Week 3)
- [ ] Add React.memo where beneficial
- [ ] Add useMemo/useCallback optimizations
- [ ] Create AuthForm shared component
- [ ] Add Error Boundary
- [ ] Write tests for hooks

---

## Testing Strategy

### Test Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useJournal } from '../useJournal';

describe('useJournal', () => {
  it('should load entries on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useJournal({}));

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.entries).toBeDefined();
  });

  it('should create new entry', async () => {
    const { result } = renderHook(() => useJournal({}));

    await act(async () => {
      await result.current.createEntry({
        title: 'Test',
        content: 'Test content',
        mood: 'happy',
        tags: [],
        xp: 50
      });
    });

    expect(result.current.entries).toHaveLength(1);
  });
});
```

### Test Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import JournalForm from '../JournalForm';

describe('JournalForm', () => {
  it('should validate required fields', async () => {
    const onSubmit = jest.fn();
    render(<JournalForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByText('🚀 Save Entry'));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form', async () => {
    const onSubmit = jest.fn();
    render(<JournalForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('What did you accomplish today?'), {
      target: { value: 'My Title' }
    });

    fireEvent.change(screen.getByPlaceholderText('Describe your journey in detail...'), {
      target: { value: 'My Content' }
    });

    fireEvent.click(screen.getByText('🚀 Save Entry'));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My Title',
      content: 'My Content',
      mood: 'neutral',
      tags: [],
      xp: 50
    });
  });
});
```

---

**Document Version**: 1.0
**Last Updated**: 2025-12-11
**Ready for Implementation**: ✅

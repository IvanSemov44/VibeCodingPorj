/**
 * JournalFilters Component
 * Search and filter controls for journal entries
 */

import React from 'react';
import { MOOD_OPTIONS, TAG_OPTIONS } from '../../lib/constants';
import type { MoodOption } from '../../lib/constants';

interface JournalFiltersProps {
  search: string;
  moodFilter: string;
  tagFilter: string;
  onSearchChange: (value: string) => void;
  onMoodChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function JournalFilters({
  search,
  moodFilter,
  tagFilter,
  onSearchChange,
  onMoodChange,
  onTagChange,
  onClearFilters,
  hasActiveFilters
}: JournalFiltersProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="🔍 Search entries..."
        style={{
          flex: '1 1 200px',
          padding: '10px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          fontSize: 14,
          color: 'var(--text-primary)',
          outline: 'none'
        }}
      />

      <select
        value={moodFilter}
        onChange={(e) => onMoodChange(e.currentTarget.value)}
        style={{
          padding: '10px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          fontSize: 14,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="">All Moods</option>
        {MOOD_OPTIONS.map((mood: MoodOption) => (
          <option key={mood.value} value={mood.value}>
            {mood.emoji} {mood.label}
          </option>
        ))}
      </select>

      <select
        value={tagFilter}
        onChange={(e) => onTagChange(e.currentTarget.value)}
        style={{
          padding: '10px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          fontSize: 14,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="">All Tags</option>
        {TAG_OPTIONS.map((tag: string) => (
          <option key={tag} value={tag}>
            #{tag}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

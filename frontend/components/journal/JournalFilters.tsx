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
  hasActiveFilters,
}: JournalFiltersProps): React.ReactElement {
  return (
    <div className="flex gap-3 mb-5 flex-wrap items-center">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="🔍 Search entries..."
        className="flex-[1_1_200px] px-3 py-2.5 bg-secondary-bg border border-border rounded-lg text-sm text-primary-text outline-none focus:border-accent transition-colors"
      />

      <select
        value={moodFilter}
        onChange={(e) => onMoodChange(e.currentTarget.value)}
        className="px-3 py-2.5 bg-secondary-bg border border-border rounded-lg text-sm text-primary-text cursor-pointer outline-none focus:border-accent transition-colors"
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
        className="px-3 py-2.5 bg-secondary-bg border border-border rounded-lg text-sm text-primary-text cursor-pointer outline-none focus:border-accent transition-colors"
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
          className="px-4 py-2.5 bg-secondary-bg border border-border rounded-lg text-[13px] font-semibold text-secondary-text cursor-pointer transition-all hover:bg-tertiary-bg hover:border-border-hover"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

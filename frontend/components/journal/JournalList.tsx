/**
 * JournalList Component
 * Displays list of journal entries with loading and empty states
 */

import React from 'react';
import JournalEntry from '../JournalEntry';
import { LoadingPage } from '../Loading';
import type { JournalEntry as JournalEntryModel } from '../../lib/types';

interface JournalListProps {
  entries: JournalEntryModel[];
  loading: boolean;
  hasFilters: boolean;
  onDelete: (id: number | string) => Promise<void>;
}

export default function JournalList({ entries, loading, hasFilters, onDelete }: JournalListProps): React.ReactElement {
  if (loading) {
    return <LoadingPage message="Loading entries..." />;
  }

  if (entries.length === 0) {
    return (
      <div className="p-12 text-center bg-secondary-bg border-2 border-dashed border-border rounded-xl">
        <div className="text-5xl mb-4">📖</div>
        <h3 className="m-0 mb-2 text-lg font-semibold text-primary-text">
          No entries yet
        </h3>
        <p className="m-0 text-sm text-secondary-text">
          {hasFilters
            ? 'No entries match your filters. Try adjusting them.'
            : 'Start your adventure by creating your first journal entry!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map(entry => (
        <JournalEntry key={entry.id} entry={entry} onDelete={onDelete} />
      ))}
    </div>
  );
}

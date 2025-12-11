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
      <div style={{
        padding: 48,
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        border: '2px dashed var(--border-color)',
        borderRadius: 12
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
          No entries yet
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
          {hasFilters
            ? 'No entries match your filters. Try adjusting them.'
            : 'Start your adventure by creating your first journal entry!'
          }
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {entries.map(entry => (
        <JournalEntry key={entry.id} entry={entry} onDelete={onDelete} />
      ))}
    </div>
  );
}

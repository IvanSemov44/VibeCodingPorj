/**
 * JournalSection Component
 * Main container for the adventure journal feature
 * Refactored to use custom hooks and sub-components
 */

import React, { useState } from 'react';
import { LoadingPage } from './Loading';
import { useJournal } from '../hooks/useJournal';
import JournalHeader from './journal/JournalHeader';
import JournalStats from './journal/JournalStats';
import JournalForm from './journal/JournalForm';
import JournalFilters from './journal/JournalFilters';
import JournalList from './journal/JournalList';
import type { JournalCreatePayload } from '../lib/types';

export default function JournalSection(): React.ReactElement {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [formError, setFormError] = useState('');

  const { entries, stats, loading, createEntry, deleteEntry } = useJournal({
    search,
    mood: moodFilter,
    tag: tagFilter
  });

  const handleSubmit = async (data: JournalCreatePayload): Promise<void> => {
    setFormError('');

    if (!data.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!data.content.trim()) {
      setFormError('Content is required');
      return;
    }

    try {
      await createEntry(data);
      setShowForm(false);
      setFormError('');
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? String(err.message)
        : 'Failed to create entry. Please try again.';
      setFormError(message);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setMoodFilter('');
    setTagFilter('');
  };

  const hasActiveFilters = Boolean(search || moodFilter || tagFilter);

  if (loading && !stats) {
    return <LoadingPage message="Loading your adventure journal..." />;
  }

  return (
    <div style={{ marginTop: 32 }}>
      <JournalHeader onNewEntry={() => setShowForm(!showForm)} showForm={showForm} />

      <JournalStats stats={stats} />

      {showForm && (
        <JournalForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          submitting={false}
          error={formError}
        />
      )}

      <JournalFilters
        search={search}
        moodFilter={moodFilter}
        tagFilter={tagFilter}
        onSearchChange={setSearch}
        onMoodChange={setMoodFilter}
        onTagChange={setTagFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <JournalList
        entries={entries}
        loading={loading}
        hasFilters={hasActiveFilters}
        onDelete={deleteEntry}
      />
    </div>
  );
}

/**
 * JournalHeader Component
 * Displays journal title, description, and new entry button
 */

import React from 'react';

interface JournalHeaderProps {
  onNewEntry: () => void;
  showForm: boolean;
}

export default function JournalHeader({ onNewEntry, showForm }: JournalHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h2 className="m-0 text-3xl font-bold text-primary-text flex items-center gap-3">
          📖 Adventure Journal
        </h2>
        <p className="mt-1 text-sm text-secondary-text">
          Track your coding journey and earn XP!
        </p>
      </div>

      <button
        onClick={onNewEntry}
        className={`px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 ${
          showForm
            ? 'bg-secondary-bg text-primary-text border-2 border-border'
            : 'bg-accent text-white border-none hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
        }`}
      >
        <span className="text-lg">{showForm ? '✖️' : '✨'}</span>
        {showForm ? 'Cancel' : 'New Entry'}
      </button>
    </div>
  );
}

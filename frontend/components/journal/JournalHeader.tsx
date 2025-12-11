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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
          📖 Adventure Journal
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
          Track your coding journey and earn XP!
        </p>
      </div>

      <button
        onClick={onNewEntry}
        style={{
          background: showForm ? 'var(--bg-secondary)' : 'var(--accent-primary)',
          color: showForm ? 'var(--text-primary)' : 'white',
          border: showForm ? '2px solid var(--border-color)' : 'none',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        onMouseEnter={(e) => {
          if (!showForm) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <span style={{ fontSize: 18 }}>{showForm ? '✖️' : '✨'}</span>
        {showForm ? 'Cancel' : 'New Entry'}
      </button>
    </div>
  );
}

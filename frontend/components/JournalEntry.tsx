import React, { useState } from 'react';
import type { JournalEntry as JournalEntryModel } from '../lib/types';

type MoodKey = 'excited' | 'happy' | 'neutral' | 'tired' | 'victorious';

const MOOD_CONFIG: Record<MoodKey, { emoji: string; color: string; label: string }> = {
  excited: { emoji: '🚀', color: '#f59e0b', label: 'Excited' },
  happy: { emoji: '😊', color: '#10b981', label: 'Happy' },
  neutral: { emoji: '😐', color: '#6b7280', label: 'Neutral' },
  tired: { emoji: '😴', color: '#8b5cf6', label: 'Tired' },
  victorious: { emoji: '🏆', color: '#ef4444', label: 'Victorious' }
};

interface Props {
  entry: JournalEntryModel;
  onDelete: (id: string | number) => Promise<void> | void;
}

export default function JournalEntry({ entry, onDelete }: Props): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mood = MOOD_CONFIG[(entry.mood as MoodKey) || 'neutral'] || MOOD_CONFIG.neutral;
  const date = new Date(entry.created_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    setDeleting(true);
    try {
      await onDelete(entry.id);
    } catch {
      setDeleting(false);
      // keep UX simple for now
      // eslint-disable-next-line no-alert
      alert('Failed to delete entry. Please try again.');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '2px solid var(--border-color)',
      borderRadius: 12,
      padding: 16,
      transition: 'all 0.3s',
      opacity: deleting ? 0.5 : 1,
      pointerEvents: deleting ? 'none' : 'auto',
      ...(expanded && {
        borderColor: mood.color,
        boxShadow: `0 4px 12px ${mood.color}30`
      })
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
        <div style={{
          fontSize: 32,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${mood.color}20`,
          borderRadius: 10,
          flexShrink: 0
        }}>
          {mood.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, marginBottom: 4, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', wordWrap: 'break-word' }}>
            {entry.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: mood.color, fontWeight: 600, textTransform: 'uppercase' }}>{mood.label}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formattedDate}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', background: '#f59e0b20', padding: '2px 8px', borderRadius: 6 }}>+{entry.xp} XP</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4, fontSize: 18, transition: 'color 0.2s', flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
          title="Delete entry"
        >
          🗑️
        </button>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {entry.tags.map((tag, i) => (
            <span key={i} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-secondary)', fontWeight: 500 }}>#{tag}</span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', maxHeight: expanded ? 'none' : 60, overflow: 'hidden', marginBottom: 12, whiteSpace: expanded ? 'pre-wrap' : 'nowrap', textOverflow: expanded ? 'clip' : 'ellipsis' }}>
        {entry.content}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{ background: 'transparent', border: 'none', color: mood.color, cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0, textDecoration: 'underline', transition: 'opacity 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        {expanded ? '▲ Show Less' : '▼ Read More'}
      </button>
    </div>
  );
}

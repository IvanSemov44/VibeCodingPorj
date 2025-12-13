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
       
      alert('Failed to delete entry. Please try again.');
    }
  };

  return (
    <div
      className={`bg-secondary-bg border-2 border-border rounded-xl p-4 transition-all duration-300 ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
      style={expanded ? { borderColor: mood.color, boxShadow: `0 4px 12px ${mood.color}30` } : undefined}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="text-[32px] w-12 h-12 flex items-center justify-center rounded-[10px] flex-shrink-0"
          style={{ background: `${mood.color}20` }}
        >
          {mood.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="m-0 mb-1 text-lg font-semibold text-primary-text break-words">
            {entry.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold uppercase" style={{ color: mood.color }}>{mood.label}</span>
            <span className="text-xs text-tertiary-text">{formattedDate}</span>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 py-0.5 px-2 rounded-md">+{entry.xp} XP</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-transparent border-none text-tertiary-text cursor-pointer p-1 text-lg transition-colors flex-shrink-0 hover:text-red-500"
          title="Delete entry"
        >
          🗑️
        </button>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {entry.tags.map((tag, i) => (
            <span key={i} className="text-[11px] py-1 px-2.5 bg-tertiary-bg border border-border rounded-md text-secondary-text font-medium">#{tag}</span>
          ))}
        </div>
      )}

      <div className={`text-sm leading-relaxed text-secondary-text overflow-hidden mb-3 ${expanded ? 'max-h-none whitespace-pre-wrap' : 'max-h-[60px] whitespace-nowrap text-ellipsis'}`}>
        {entry.content}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-transparent border-none cursor-pointer text-[13px] font-semibold p-0 underline transition-opacity hover:opacity-70"
        style={{ color: mood.color }}
      >
        {expanded ? '▲ Show Less' : '▼ Read More'}
      </button>
    </div>
  );
}

/**
 * JournalForm Component
 * Form for creating new journal entries
 */

import React, { useState } from 'react';
import MoodSelector from './components/MoodSelector';
import TagSelector from './components/TagSelector';
import XPSlider from './components/XPSlider';
import type { JournalCreatePayload } from '../../lib/types';

interface JournalFormProps {
  onSubmit: (data: JournalCreatePayload) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error: string;
}

export default function JournalForm({ onSubmit, onCancel, submitting, error }: JournalFormProps): React.ReactElement {
  const [formData, setFormData] = useState<JournalCreatePayload>({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
    xp: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags ?? [];
      const nextTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
      return {
        ...prev,
        tags: nextTags
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--bg-secondary)',
      border: '2px solid var(--accent-primary)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
        ✨ Record Your Adventure
      </h3>

      {error && (
        <div style={{
          padding: 12,
          background: '#ef444420',
          border: '1px solid #ef4444',
          borderRadius: 8,
          color: '#ef4444',
          fontSize: 14,
          marginBottom: 16
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
          placeholder="What did you accomplish today?"
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 14,
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border-color)'}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
          Content *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
          placeholder="Describe your journey in detail..."
          rows={6}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 14,
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border-color)'}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <MoodSelector
          value={formData.mood ?? 'neutral'}
          onChange={(mood) => setFormData({ ...formData, mood })}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <TagSelector
          selectedTags={formData.tags ?? []}
          onToggle={toggleTag}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <XPSlider
          value={formData.xp ?? 50}
          onChange={(xp) => setFormData({ ...formData, xp })}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={() => onCancel()}
          disabled={submitting}
          style={{
            flex: '0 0 auto',
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px',
            background: submitting ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          {submitting ? '⏳ Saving...' : '🚀 Save Entry'}
        </button>
      </div>
    </form>
  );
}

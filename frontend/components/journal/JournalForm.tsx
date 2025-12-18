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

export default function JournalForm({
  onSubmit,
  onCancel,
  submitting,
  error,
}: JournalFormProps): React.ReactElement {
  const [formData, setFormData] = useState<JournalCreatePayload>({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
    xp: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags ?? [];
      const nextTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return {
        ...prev,
        tags: nextTags,
      };
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-secondary-bg border-2 border-accent rounded-xl p-5 mb-6 shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
    >
      <h3 className="m-0 mb-4 text-lg font-semibold text-primary-text">✨ Record Your Adventure</h3>

      {error && <div className="p-3 rounded-lg text-sm alert-error mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-secondary-text mb-1.5">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
          placeholder="What did you accomplish today?"
          className="w-full px-3 py-2.5 bg-primary-bg border border-border rounded-lg text-sm text-primary-text outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-secondary-text mb-1.5">
          Content *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
          placeholder="Describe your journey in detail..."
          rows={6}
          className="w-full px-3 py-2.5 bg-primary-bg border border-border rounded-lg text-sm text-primary-text outline-none transition-colors resize-y font-[inherit] focus:border-accent"
        />
      </div>

      <div className="mb-4">
        <MoodSelector
          value={formData.mood ?? 'neutral'}
          onChange={(mood) => setFormData({ ...formData, mood })}
        />
      </div>

      <div className="mb-4">
        <TagSelector selectedTags={formData.tags ?? []} onToggle={toggleTag} />
      </div>

      <div className="mb-5">
        <XPSlider value={formData.xp ?? 50} onChange={(xp) => setFormData({ ...formData, xp })} />
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => onCancel()}
          disabled={submitting}
          className="flex-[0_0_auto] px-4 py-3 bg-secondary-bg text-secondary-text border border-border rounded-lg cursor-pointer disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className={`flex-1 py-3 border-none rounded-lg text-sm font-semibold transition-all duration-200 ${
            submitting
              ? 'bg-tertiary-bg cursor-not-allowed'
              : 'bg-accent text-white cursor-pointer hover:opacity-90'
          }`}
        >
          {submitting ? '⏳ Saving...' : '🚀 Save Entry'}
        </button>
      </div>
    </form>
  );
}

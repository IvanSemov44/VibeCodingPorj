/**
 * MoodSelector Component
 * Displays mood options as selectable buttons
 */

import React from 'react';
import { MOOD_OPTIONS } from '../../../lib/constants';
import type { MoodOption } from '../../../lib/constants';

interface MoodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps): React.ReactElement {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-secondary-text mb-2">
        How are you feeling? *
      </label>
      <div className="flex gap-2 flex-wrap">
        {MOOD_OPTIONS.map((mood: MoodOption) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={`px-4 py-2 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5 border-2 ${
              value === mood.value
                ? 'border-current'
                : 'border-border bg-primary-bg text-secondary-text'
            }`}
            style={
              value === mood.value
                ? { background: `${mood.color}20`, borderColor: mood.color, color: mood.color }
                : undefined
            }
          >
            <span className="text-lg">{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
}

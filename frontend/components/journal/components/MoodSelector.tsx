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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
        How are you feeling? *
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {MOOD_OPTIONS.map((mood: MoodOption) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            style={{
              padding: '8px 16px',
              background: value === mood.value ? `${mood.color}20` : 'var(--bg-primary)',
              border: `2px solid ${value === mood.value ? mood.color : 'var(--border-color)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: value === mood.value ? mood.color : 'var(--text-secondary)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 18 }}>{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * XPSlider Component
 * Range input for selecting XP value with labels
 */

import React from 'react';

interface XPSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function XPSlider({ value, onChange }: XPSliderProps): React.ReactElement {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
        XP Earned: <span style={{ color: '#f59e0b', fontSize: 16 }}>{value}</span>
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.currentTarget.value))}
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
        <span>1 XP</span>
        <span>100 XP</span>
      </div>
    </div>
  );
}

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
      <label className="block text-[13px] font-semibold text-secondary-text mb-2">
        XP Earned: <span className="text-[#f59e0b] text-base">{value}</span>
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.currentTarget.value))}
        className="w-full h-1.5 rounded-sm outline-none cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-tertiary-text mt-1">
        <span>1 XP</span>
        <span>100 XP</span>
      </div>
    </div>
  );
}

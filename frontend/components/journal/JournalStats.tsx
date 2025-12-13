/**
 * JournalStats Component
 * Displays journal statistics in a grid layout
 */

import React from 'react';
import type { JournalStats as JournalStatsType } from '../../lib/types';

interface JournalStatsProps {
  stats: JournalStatsType | null;
}

interface StatItemProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps): React.ReactElement {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold mb-0.5`} style={{ color }}>{value}</div>
      <div className="text-[11px] text-tertiary-text uppercase font-semibold">{label}</div>
    </div>
  );
}

export default function JournalStats({ stats }: JournalStatsProps): React.ReactElement | null {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-6 p-4 bg-secondary-bg border-2 border-border rounded-xl">
      <StatItem icon="📚" label="Total Entries" value={stats.total_entries} color="#3b82f6" />
      <StatItem icon="⭐" label="Total XP" value={stats.total_xp} color="#f59e0b" />
      <StatItem icon="📅" label="This Week" value={stats.entries_this_week} color="#10b981" />
      <StatItem icon="🔥" label="Streak" value={`${stats.recent_streak} days`} color="#ef4444" />
    </div>
  );
}

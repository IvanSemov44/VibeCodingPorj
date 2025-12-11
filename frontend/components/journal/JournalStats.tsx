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
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function JournalStats({ stats }: JournalStatsProps): React.ReactElement | null {
  if (!stats) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      marginBottom: 24,
      padding: 16,
      background: 'var(--bg-secondary)',
      border: '2px solid var(--border-color)',
      borderRadius: 12
    }}>
      <StatItem icon="📚" label="Total Entries" value={stats.total_entries} color="#3b82f6" />
      <StatItem icon="⭐" label="Total XP" value={stats.total_xp} color="#f59e0b" />
      <StatItem icon="📅" label="This Week" value={stats.entries_this_week} color="#10b981" />
      <StatItem icon="🔥" label="Streak" value={`${stats.recent_streak} days`} color="#ef4444" />
    </div>
  );
}

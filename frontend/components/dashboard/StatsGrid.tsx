/**
 * StatsGrid Component
 * Displays dashboard statistics in a grid layout
 */

import React from 'react';
import Card from '../Card';
import type { DashboardStat } from '../../lib/constants';

interface StatsGridProps {
  stats: DashboardStat[];
}

export default function StatsGrid({ stats }: StatsGridProps): React.ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
      {stats.map((stat, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
            </div>
            <div style={{
              fontSize: 36,
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${stat.color}15`,
              borderRadius: 12
            }}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

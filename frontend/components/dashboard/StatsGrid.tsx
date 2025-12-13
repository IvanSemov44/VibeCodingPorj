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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 mb-8">
      {stats.map((stat, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary-text mb-1">{stat.label}</div>
              <div className="text-4xl font-bold text-primary-text">{stat.value}</div>
            </div>
            <div
              className="text-4xl w-16 h-16 flex items-center justify-center rounded-xl"
              style={{ background: `${stat.color}15` }}
            >
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

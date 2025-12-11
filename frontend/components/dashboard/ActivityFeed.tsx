/**
 * ActivityFeed Component
 * Displays recent activity with icons and timestamps
 */

import React from 'react';
import Card from '../Card';
import { MOCK_ACTIVITIES } from '../../lib/constants';
import type { Activity } from '../../lib/constants';

interface ActivityItemProps {
  icon: string;
  text: string;
  time: string;
  color: string;
}

function ActivityItem({ icon, text, time, color }: ActivityItemProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
          {text}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {time}
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed(): React.ReactElement {
  return (
    <Card
      title="Recent Activity"
      footer={
        <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: 13 }}>
          View all activity →
        </a>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_ACTIVITIES.map((activity: Activity, index: number) => (
          <ActivityItem
            key={index}
            icon={activity.icon}
            text={activity.text}
            time={activity.time}
            color={activity.color}
          />
        ))}
      </div>
    </Card>
  );
}

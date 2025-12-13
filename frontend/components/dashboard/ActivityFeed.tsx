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
    <div className="flex gap-3 items-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-primary-text mb-0.5">
          {text}
        </div>
        <div className="text-xs text-tertiary-text">
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
        <a href="#" className="text-accent no-underline text-[13px] hover:underline">
          View all activity →
        </a>
      }
    >
      <div className="flex flex-col gap-4">
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

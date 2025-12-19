/**
 * QuickActions Component
 * Displays a list of quick action buttons
 */

import React from 'react';
import { Card } from '../ui';

// Local actions used on admin dashboard. (Currently no quick actions configured.)
const ACTIONS: Array<{ icon: string; label: string; href: string }> = [];

interface ActionButtonProps {
  icon: string;
  label: string;
}

function ActionButton({ icon, label }: ActionButtonProps): React.ReactElement {
  return (
    <button className="flex items-center gap-3 px-4 py-3 bg-secondary-bg border border-border rounded-lg cursor-pointer text-sm font-medium text-primary-text transition-all duration-200 text-left w-full hover:bg-tertiary-bg hover:border-border-hover">
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function QuickActions(): React.ReactElement {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-col gap-3">
        {ACTIONS.length === 0 ? (
          <div className="text-sm text-gray-500">No quick actions configured.</div>
        ) : (
          ACTIONS.map((action) => (
            <a key={action.label} href={action.href}>
              <ActionButton icon={action.icon} label={action.label} />
            </a>
          ))
        )}
      </div>
    </Card>
  );
}

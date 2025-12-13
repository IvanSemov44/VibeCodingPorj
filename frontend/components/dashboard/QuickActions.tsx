/**
 * QuickActions Component
 * Displays a list of quick action buttons
 */

import React from 'react';
import Card from '../Card';
import { QUICK_ACTIONS } from '../../lib/constants';
import type { QuickAction } from '../../lib/constants';

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
        {QUICK_ACTIONS.map((action: QuickAction) => (
          <ActionButton key={action.label} icon={action.icon} label={action.label} />
        ))}
      </div>
    </Card>
  );
}

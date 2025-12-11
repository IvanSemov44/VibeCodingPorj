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
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-primary)',
      transition: 'all 0.2s',
      textAlign: 'left',
      width: '100%'
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)';
      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function QuickActions(): React.ReactElement {
  return (
    <Card title="Quick Actions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {QUICK_ACTIONS.map((action: QuickAction) => (
          <ActionButton key={action.label} icon={action.icon} label={action.label} />
        ))}
      </div>
    </Card>
  );
}

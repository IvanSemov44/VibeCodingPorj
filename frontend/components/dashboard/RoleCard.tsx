/**
 * RoleCard Component
 * Displays role-specific content and tasks
 */

import React from 'react';
import Card from '../Card';
import { getRoleTitle, getRoleContent } from '../../lib/constants';

interface RoleCardProps {
  roles: string[] | undefined;
}

export default function RoleCard({ roles }: RoleCardProps): React.ReactElement {
  return (
    <Card title={getRoleTitle(roles)}>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {getRoleContent(roles)}
      </div>
    </Card>
  );
}

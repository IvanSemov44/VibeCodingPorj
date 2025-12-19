/**
 * RoleCard Component
 * Displays role-specific content and tasks
 */

import React from 'react';
import { Card } from '../ui';
import { getRoleTitle, getRoleContent } from '../../lib/constants';

interface RoleCardProps {
  roles: string[] | undefined;
}

export default function RoleCard({ roles }: RoleCardProps): React.ReactElement {
  return (
    <Card title={getRoleTitle(roles)}>
      <div className="text-sm text-secondary-text leading-relaxed">{getRoleContent(roles)}</div>
    </Card>
  );
}

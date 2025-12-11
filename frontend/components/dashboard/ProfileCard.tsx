/**
 * ProfileCard Component
 * Displays user profile information including name, email, and roles
 */

import React from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { getRoleColor } from '../../lib/constants';
import type { User } from '../../lib/types';

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps): React.ReactElement {
  return (
    <Card title="Profile Information">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Name
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>
            {user.name}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Email
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>
            {user.email}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
            Roles
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((roleName: string) => (
                <Badge key={roleName} variant={getRoleColor(roleName)}>
                  {roleName}
                </Badge>
              ))
            ) : (
              <span style={{ color: 'var(--text-tertiary)' }}>No roles assigned</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

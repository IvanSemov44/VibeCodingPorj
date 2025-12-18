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
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-xs text-secondary-text mb-1 uppercase font-semibold">Name</div>
          <div className="text-base text-primary-text">{user.name}</div>
        </div>

        <div>
          <div className="text-xs text-secondary-text mb-1 uppercase font-semibold">Email</div>
          <div className="text-base text-primary-text">{user.email}</div>
        </div>

        <div>
          <div className="text-xs text-secondary-text mb-2 uppercase font-semibold">Roles</div>
          <div className="flex gap-2 flex-wrap">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((roleItem) => {
                const roleName = typeof roleItem === 'string' ? roleItem : roleItem.name;
                return (
                  <Badge key={roleName} variant={getRoleColor(roleName)}>
                    {roleName}
                  </Badge>
                );
              })
            ) : (
              <span className="text-tertiary-text">No roles assigned</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

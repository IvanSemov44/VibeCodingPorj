/**
 * RoleSelector Component
 * Multi-select buttons for role selection
 */

import React from 'react';

type Role = { id: number; name: string };

interface RoleSelectorProps {
  roles: Role[];
  selectedRoles: number[];
  onToggle: (roleId: number) => void;
}

export default function RoleSelector({ roles, selectedRoles, onToggle }: RoleSelectorProps): React.ReactElement {
  const toggleRole = (roleId: number) => {
    onToggle(roleId);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>Roles</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {roles.map(r => {
          const isSelected = selectedRoles.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => toggleRole(r.id)}
              style={{
                padding: '6px 10px',
                background: isSelected ? '#2563eb' : '#f3f4f6',
                color: isSelected ? 'white' : 'inherit',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {r.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

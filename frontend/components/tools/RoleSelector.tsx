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

export default function RoleSelector({
  roles,
  selectedRoles,
  onToggle,
}: RoleSelectorProps): React.ReactElement {
  const toggleRole = (roleId: number) => {
    onToggle(roleId);
  };

  return (
    <div className="mt-3">
      <label className="block font-semibold mb-1 text-sm text-primary-text">Roles</label>
      <div className="flex gap-2 flex-wrap mt-2">
        {roles.map((r) => {
          const isSelected = selectedRoles.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => toggleRole(r.id)}
              className={`px-2.5 py-1.5 rounded-md border-none cursor-pointer text-[13px] font-medium transition-all ${
                isSelected
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-gray-100 text-inherit hover:bg-gray-200'
              }`}
            >
              {r.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

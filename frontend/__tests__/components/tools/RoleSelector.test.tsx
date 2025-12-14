import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../../tests/test-utils';
import RoleSelector from '../../../components/tools/RoleSelector';
import { describe, test, expect, vi } from 'vitest';

describe('RoleSelector', () => {
  const roles = [
    { id: 1, name: 'Frontend' },
    { id: 2, name: 'Backend' },
  ];

  test('renders role buttons and toggles', async () => {
    const onToggle = vi.fn();
    renderWithProviders(<RoleSelector roles={roles} selectedRoles={[2]} onToggle={onToggle} />);

    const frontBtn = screen.getByText('Frontend');
    const backBtn = screen.getByText('Backend');

    expect(frontBtn).toBeInTheDocument();
    expect(backBtn).toBeInTheDocument();

    // Backend is initially selected (selectedRoles contains 2)
    expect(backBtn.className).toContain('text-white');
    expect(frontBtn.className).not.toContain('text-white');

    await userEvent.click(frontBtn);
    expect(onToggle).toHaveBeenCalledWith(1);
  });
});

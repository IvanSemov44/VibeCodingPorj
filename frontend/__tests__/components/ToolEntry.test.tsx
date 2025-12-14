import { vi } from 'vitest';
// mock store hooks before importing modules that use them
vi.mock('../../store/api2', () => ({ useDeleteToolMutation: vi.fn() }));
import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import ToolEntry from '../../components/ToolEntry';
import * as api from '../../store/api2';
import { describe, test, expect } from 'vitest';

describe('ToolEntry', () => {
  test('renders and handles delete', async () => {
    const tool = { id: 5, name: 'X', description: 'D', url: 'https://x', screenshots: [] } as any;
    const onDeleted = vi.fn();

    const deleteTrigger = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
    vi.mocked(api.useDeleteToolMutation).mockReturnValue([deleteTrigger, { isLoading: false }] as any);
    const oldConfirm = global.confirm;
    (global as any).confirm = () => true;

    renderWithProviders(<ToolEntry tool={tool} onDeleted={onDeleted} />);

    expect(screen.getByText('X')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Delete'));
    expect(deleteTrigger).toHaveBeenCalledWith(5);
    expect(onDeleted).toHaveBeenCalledWith(5);

    (global as any).confirm = oldConfirm;
  });
});

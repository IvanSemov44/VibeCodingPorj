import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import ToolEntry from '../../components/ToolEntry';
import * as api from '../../lib/api';
import { describe, test, expect, vi } from 'vitest';

describe('ToolEntry', () => {
  test('renders and handles delete', async () => {
    const tool = { id: 5, name: 'X', description: 'D', url: 'https://x', screenshots: [] } as any;
    const onDeleted = vi.fn();

    const spy = vi.spyOn(api, 'deleteTool').mockResolvedValue(undefined as any);
    const oldConfirm = global.confirm;
    (global as any).confirm = () => true;

    renderWithProviders(<ToolEntry tool={tool} onDeleted={onDeleted} />);

    expect(screen.getByText('X')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Delete'));
    expect(spy).toHaveBeenCalledWith(5);
    expect(onDeleted).toHaveBeenCalledWith(5);

    spy.mockRestore();
    (global as any).confirm = oldConfirm;
  });
});

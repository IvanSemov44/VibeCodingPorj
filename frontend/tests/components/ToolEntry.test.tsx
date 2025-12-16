import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, userEvent, screen } from '../test-utils';
import ToolEntry from '../../components/ToolEntry';

// Mock the API mutation hook used by the component
vi.mock('../../store/domains', () => ({
  useDeleteToolMutation: vi.fn(),
}));

describe('ToolEntry', () => {
  beforeEach(() => {
    const root = document.createElement('div');
    root.setAttribute('data-test-root', 'true');
    document.body.appendChild(root);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const root = document.querySelector('[data-test-root]');
    root?.remove();
  });

  it('renders visit link, edit and delete, and calls onDeleted when delete succeeds', async () => {
    const tool = {
      id: 't1',
      name: 'Tool One',
      description: 'A useful tool',
      url: 'https://example.com',
      screenshots: [],
    } as any;

    // prepare the mocked hook to return a trigger whose unwrap resolves
    const api = await import('../../store/domains');
    const mockedTrigger = vi.fn(() => ({ unwrap: () => Promise.resolve() }));
    vi.mocked(api.useDeleteToolMutation).mockReturnValue([mockedTrigger, {}] as any);

    const onDeleted = vi.fn();
    renderWithProviders(<ToolEntry tool={tool} onDeleted={onDeleted} />);

    expect(screen.getByText('Tool One')).toBeTruthy();
    expect(screen.getByText('A useful tool')).toBeTruthy();

    const visit = screen.getByText('Visit');
    expect(visit).toBeTruthy();

    // mock confirm to true
    // @ts-ignore
    window.confirm = vi.fn(() => true);

    const delBtn = screen.getByText('Delete');
    await userEvent.click(delBtn);

    expect(mockedTrigger).toHaveBeenCalledWith('t1');
    // onDeleted should be called after successful unwrap
    expect(onDeleted).toHaveBeenCalledWith('t1');
  });

  it('alerts on delete failure', async () => {
    const tool = { id: 't2', name: 'Broken', description: '', screenshots: [] } as any;
    const api = await import('../../store/domains');
    const mockedTrigger = vi.fn(() => ({ unwrap: async () => { throw new Error('fail'); } }));
    vi.mocked(api.useDeleteToolMutation).mockReturnValue([mockedTrigger, {}] as any);

    // mock confirm true and alert
    // @ts-ignore
    window.confirm = vi.fn(() => true);
    // @ts-ignore
    window.alert = vi.fn();

    renderWithProviders(<ToolEntry tool={tool} />);
    const delBtn = screen.getByText('Delete');
    await userEvent.click(delBtn);

    expect(mockedTrigger).toHaveBeenCalledWith('t2');
    // wait for the async rejection to be handled and alert to be called
    const { waitFor } = await import('@testing-library/react');
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });
});

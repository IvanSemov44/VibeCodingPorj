import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, userEvent, screen } from '../test-utils';
import JournalEntry from '../../components/JournalEntry';

const baseEntry = {
  id: 'e1',
  title: 'My Entry',
  mood: 'happy',
  created_at: new Date('2023-01-02T12:34:00Z').toISOString(),
  xp: 12,
  tags: ['work', 'coding'],
  content: 'This is the content for the journal entry. It can be long.',
};

describe('JournalEntry', () => {
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

  it('renders basic fields and toggles expand', async () => {
    const onDelete = vi.fn();
    renderWithProviders(<JournalEntry entry={baseEntry as any} onDelete={onDelete} />);

    expect(screen.getByText('My Entry')).toBeTruthy();
    expect(screen.getByText('+12 XP')).toBeTruthy();
    expect(screen.getByText('#work')).toBeTruthy();
    expect(screen.getByText('#coding')).toBeTruthy();

    const toggle = screen.getByRole('button', { name: /read more/i });
    expect(toggle).toBeTruthy();
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: /show less/i })).toBeTruthy();
  });

  it('calls onDelete when confirmed and shows alert on failure', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('boom'));
    // mock confirm and alert
    // @ts-ignore
    window.confirm = vi.fn(() => true);
    // @ts-ignore
    window.alert = vi.fn();

    renderWithProviders(<JournalEntry entry={baseEntry as any} onDelete={onDelete} />);

    const deleteBtn = screen.getByTitle('Delete entry');
    await userEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith('e1');
    expect(window.alert).toHaveBeenCalled();
  });
});

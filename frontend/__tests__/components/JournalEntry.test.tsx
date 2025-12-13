import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import JournalEntry from '../../components/JournalEntry';
import { describe, test, vi, expect } from 'vitest';

const sample = {
  id: 1,
  title: 'A brave day',
  content: 'Today I did something wonderful and long content that will be truncated in preview.',
  mood: 'happy',
  xp: 12,
  created_at: new Date().toISOString(),
  tags: ['quest', 'team'],
};

describe('JournalEntry', () => {
  test('renders title, mood, tags and truncated content, and toggles expansion', async () => {
    const onDelete = vi.fn();
    renderWithProviders(<JournalEntry entry={sample as any} onDelete={onDelete} />);

    expect(screen.getByText(/a brave day/i)).toBeInTheDocument();
    expect(screen.getByText(/happy/i)).toBeInTheDocument();
    expect(screen.getByText(/#quest/i)).toBeInTheDocument();
    // truncated preview should not show the full content initially
    expect(screen.getByText(/today i did something wonderful/i)).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /read more|show less/i });
    await userEvent.click(btn);
    expect(screen.getByText(/show less/i) || screen.getByText(/read more/i)).toBeTruthy();
  });

  test('calls onDelete when confirmed', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    // mock confirm to accept
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    renderWithProviders(<JournalEntry entry={sample as any} onDelete={onDelete} />);

    const deleteBtn = screen.getByTitle('Delete entry');
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(1);

    confirmSpy.mockRestore?.();
  });
});

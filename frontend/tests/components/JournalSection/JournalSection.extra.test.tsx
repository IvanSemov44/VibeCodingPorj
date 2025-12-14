import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import JournalSection from '../../../components/JournalSection';
import { useJournal } from '../../../hooks/useJournal';
import { useToast } from '../../../components/Toast';
import { describe, expect, test, vi } from 'vitest';

// We'll mock internal children and hooks to exercise JournalSection logic
const mockCreate = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../../hooks/useJournal', () => ({
  useJournal: vi.fn(() => ({
    entries: [],
    stats: null,
    loading: true,
    createEntry: mockCreate,
    deleteEntry: mockDelete,
  })),
}));

vi.mock('../../../components/Toast', () => ({ useToast: vi.fn(() => ({ addToast: vi.fn() })) }));

vi.mock('../../../components/journal/JournalForm', () => ({
  default: ({ onSubmit }: any) => (
    <div>
      <button onClick={() => onSubmit({ title: '', content: '', xp: 0 })}>submit-empty</button>
      <button onClick={() => onSubmit({ title: 'T', content: 'C', xp: 5 })}>submit-ok</button>
    </div>
  ),
}));

describe('JournalSection extra', () => {
  test('renders loading page when loading and no stats', () => {
    // useJournal mocked above returns loading true and stats null
    renderWithProviders(<JournalSection />);
    expect(screen.getByText(/loading your adventure journal/i)).toBeInTheDocument();
  });

  test('form validation and successful create flow', async () => {
    const addToast = vi.fn();
    // override useJournal to return non-loading for this test
    mockCreate.mockResolvedValue(undefined);
    vi.mocked(useJournal).mockImplementation(
      () =>
        ({
          entries: [],
          stats: { total: 0, xp: 0 },
          loading: false,
          createEntry: mockCreate,
          deleteEntry: mockDelete,
        } as any),
    );
    vi.mocked(useToast).mockImplementation(() => ({ addToast } as any));

    // render the real JournalSection so JournalHeader's button toggles the form
    renderWithProviders(<JournalSection />);

    // open the form via the New Entry button
    const newBtn = screen.getByText(/new entry/i);
    await userEvent.click(newBtn);

    // submit empty to trigger validation
    await userEvent.click(screen.getByText('submit-empty'));
    expect(addToast).toHaveBeenCalledWith('Title is required', 'error');

    // submit valid to trigger createEntry flow
    await userEvent.click(screen.getByText('submit-ok'));
    expect(mockCreate).toHaveBeenCalled();
  });
});

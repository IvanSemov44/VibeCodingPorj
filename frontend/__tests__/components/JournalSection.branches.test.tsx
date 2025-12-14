import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, beforeEach, expect } from 'vitest';

// Create mock functions that can be reassigned per test
const mockState = {
  createEntry: vi.fn(),
  deleteEntry: vi.fn(),
  addToast: vi.fn(),
  entries: [] as any[],
};

vi.mock('../../components/Toast', () => ({
  useToast: () => ({ addToast: mockState.addToast }),
}));

vi.mock('../../hooks/useJournal', () => ({
  useJournal: () => ({
    get entries() { return mockState.entries; },
    get stats() {
      return {
        total: mockState.entries.length,
        xp: mockState.entries.reduce((sum: number, e: any) => sum + (e.xp || 0), 0)
      };
    },
    loading: false,
    get createEntry() { return mockState.createEntry; },
    get deleteEntry() { return mockState.deleteEntry; },
    loadData: vi.fn(),
    refreshStats: vi.fn(),
  }),
}));

import JournalSection from '../../components/JournalSection';

describe('JournalSection branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.createEntry = vi.fn();
    mockState.deleteEntry = vi.fn();
    mockState.addToast = vi.fn();
    mockState.entries = [];

    // Mock window.confirm to always return true
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('createEntry failure surfaces error and toast', async () => {
    mockState.createEntry.mockRejectedValue(new Error('create-fail'));

    renderWithProviders(<JournalSection />);

    // Click "New Entry" button to open the form
    const newEntryBtn = screen.getByText(/new entry/i);
    await userEvent.click(newEntryBtn);

    // Fill in form fields - use placeholder text
    const titleInput = screen.getByPlaceholderText(/What did you accomplish/i);
    const contentInput = screen.getByPlaceholderText(/Describe your journey/i);

    await userEvent.type(titleInput, 'Test Title');
    await userEvent.type(contentInput, 'Test Content');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /save entry/i });
    await userEvent.click(submitBtn);

    await waitFor(() => expect(mockState.createEntry).toHaveBeenCalled());
    await waitFor(() => expect(mockState.addToast).toHaveBeenCalled());
  });

  test('deleteEntry failure shows error toast', async () => {
    mockState.deleteEntry.mockRejectedValue(new Error('del-fail'));
    mockState.entries = [
      {
        id: 5,
        title: 'Test Entry',
        content: 'test content',
        xp: 10,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<JournalSection />);

    // Find and click delete button - it has title "Delete entry" and shows 🗑️
    const deleteBtn = screen.getByTitle('Delete entry');
    await userEvent.click(deleteBtn);

    await waitFor(() => expect(mockState.deleteEntry).toHaveBeenCalledWith(5));
    await waitFor(() => expect(mockState.addToast).toHaveBeenCalled());
  });

  test('filters update hasFilters state', async () => {
    renderWithProviders(<JournalSection />);

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search/i);

    // Type in search to set filters
    await userEvent.type(searchInput, 'test query');

    // Verify search is applied (component should show filtered state)
    await waitFor(() => expect(searchInput).toHaveValue('test query'));

    // Clear filters
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    // Verify filters cleared
    await waitFor(() => expect(searchInput).toHaveValue(''));
  });
});

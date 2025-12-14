import React from 'react';
import { renderWithProviders, screen } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe.skip('JournalSection branch coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('createEntry failure surfaces error and toast', async () => {
    // per-test mocks
    const addToast = vi.fn();
    vi.doMock('../../components/Toast', () => ({ useToast: () => ({ addToast }) }));

    const createFail = vi.fn().mockRejectedValue(new Error('create-fail'));
    vi.doMock('../../hooks/useJournal', () => ({
      useJournal: () => ({
        entries: [],
        stats: { total: 0, xp: 0 },
        loading: false,
        createEntry: createFail,
        deleteEntry: vi.fn(),
        loadData: vi.fn(),
        refreshStats: vi.fn(),
      }),
    }));

    vi.doMock('../../components/journal/JournalForm', () => ({
      default: ({ onSubmit }: any) => (
        <div>
          <button onClick={() => onSubmit({ title: '', content: '', xp: 0 })}>submit-empty</button>
          <button onClick={() => onSubmit({ title: 'T', content: 'C', xp: 5 })}>submit-ok</button>
        </div>
      ),
    }));

    const { default: JournalSection } = await import('../../components/JournalSection');
    const { render } = await import('@testing-library/react');
    renderWithProviders(<JournalSection />);

    // open the form and trigger failing create
    await (
      await import('@testing-library/user-event')
    ).default.click(screen.getByText(/new entry/i));
    await (
      await import('@testing-library/user-event')
    ).default.click(screen.getByText('submit-ok'));

    expect(createFail).toHaveBeenCalled();
    await screen.findAllByText(/create-fail/);
    expect(addToast).toHaveBeenCalled();
  });

  test('deleteEntry failure shows error toast', async () => {
    vi.resetModules();
    const addToast = vi.fn();
    vi.doMock('../../components/Toast', () => ({ useToast: () => ({ addToast }) }));

    const deleteFail = vi.fn().mockRejectedValue(new Error('del-fail'));
    vi.doMock('../../hooks/useJournal', () => ({
      useJournal: () => ({
        entries: [{ id: 5, title: 'X', content: 'x', xp: 1, created_at: new Date().toISOString() }],
        stats: { total: 1, xp: 1 },
        loading: false,
        createEntry: vi.fn(),
        deleteEntry: deleteFail,
        loadData: vi.fn(),
        refreshStats: vi.fn(),
      }),
    }));

    vi.doMock('../../components/journal/JournalList', () => ({
      default: ({ entries, hasFilters, onDelete }: any) => (
        <div>
          <div>entries:{entries.length}</div>
          <div>hasFilters:{String(Boolean(hasFilters))}</div>
          <button onClick={() => onDelete?.(5)}>delete-5</button>
        </div>
      ),
    }));

    const { default: JournalSection } = await import('../../components/JournalSection');
    renderWithProviders(<JournalSection />);

    await (await import('@testing-library/user-event')).default.click(screen.getByText('delete-5'));

    expect(deleteFail).toHaveBeenCalledWith(5);
    expect(addToast).toHaveBeenCalled();
  });

  test('clear filters toggles hasFilters prop on JournalList', async () => {
    vi.resetModules();
    vi.doMock('../../components/Toast', () => ({ useToast: () => ({ addToast: vi.fn() }) }));

    vi.doMock('../../hooks/useJournal', () => ({
      useJournal: () => ({
        entries: [],
        stats: { total: 0, xp: 0 },
        loading: false,
        createEntry: vi.fn(),
        deleteEntry: vi.fn(),
        loadData: vi.fn(),
        refreshStats: vi.fn(),
      }),
    }));

    vi.doMock('../../components/journal/JournalFilters', () => ({
      default: ({ onSearchChange, onClearFilters }: any) => (
        <div>
          <button onClick={() => onSearchChange('q')}>set-search</button>
          <button onClick={() => onClearFilters()}>clear-filters</button>
        </div>
      ),
    }));

    vi.doMock('../../components/journal/JournalList', () => ({
      default: ({ entries, hasFilters, onDelete }: any) => (
        <div>
          <div>entries:{entries.length}</div>
          <div>hasFilters:{String(Boolean(hasFilters))}</div>
        </div>
      ),
    }));

    const { default: JournalSection } = await import('../../components/JournalSection');
    renderWithProviders(<JournalSection />);

    expect(screen.getByText(/hasFilters:false/i)).toBeInTheDocument();
    await (
      await import('@testing-library/user-event')
    ).default.click(screen.getByText('set-search'));
    expect(screen.getByText(/hasFilters:true/i)).toBeInTheDocument();
    await (
      await import('@testing-library/user-event')
    ).default.click(screen.getByText('clear-filters'));
    expect(screen.getByText(/hasFilters:false/i)).toBeInTheDocument();
  });
});

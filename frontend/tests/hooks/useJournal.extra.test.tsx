import React from 'react';
import { renderWithProviders, screen } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { useJournal } from '../../hooks/useJournal';
import * as api from '../../store/domains';
import { vi, describe, beforeEach, test, expect } from 'vitest';

// Provide mocks we can reconfigure per-test
vi.mock('../../store/domains', () => ({
  useGetEntriesQuery: vi.fn((arg: any) => ({ data: [], isLoading: false, refetch: vi.fn() })),
  useGetStatsQuery: vi.fn(() => ({
    data: { total: 0, xp: 0 },
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCreateEntryMutation: vi.fn(() => [
    vi.fn((d: any) => ({ unwrap: () => Promise.resolve({ ...d, id: 1 }) })),
    { isLoading: false },
  ]),
  useDeleteEntryMutation: vi.fn(() => [
    vi.fn((id: number | string) => ({ unwrap: () => Promise.resolve() })),
    { isLoading: false },
  ]),
}));

function Consumer(props: any) {
  const { entries, stats, loading, loadData, createEntry, deleteEntry, refreshStats } = useJournal(
    props.filters,
    props.autoLoad ?? true,
  );
  React.useEffect(() => {
    const handlers = (global as any).__TEST_HANDLERS || ((global as any).__TEST_HANDLERS = {});
    handlers.loadData = loadData;
    handlers.createEntry = createEntry;
    handlers.deleteEntry = deleteEntry;
    handlers.refreshStats = refreshStats;
    return () => {
      delete handlers.loadData;
      delete handlers.createEntry;
      delete handlers.deleteEntry;
      delete handlers.refreshStats;
    };
  }, [loadData, createEntry, deleteEntry, refreshStats]);

  return (
    <div>
      <div>entries:{entries.length}</div>
      <div>stats:{(stats as any)?.total ?? 'nil'}</div>
      <div>loading:{loading ? 'y' : 'n'}</div>
      <button onClick={() => loadData()}>load</button>
      <button onClick={() => createEntry({ title: 't', content: 'c', xp: 1 } as any)}>
        create
      </button>
      <button onClick={() => deleteEntry(5)}>del</button>
      <button onClick={() => refreshStats()}>refresh</button>
    </div>
  );
}

// expose handlers to tests to avoid unhandled rejections from async event handlers
(global as any).__TEST_HANDLERS = (global as any).__TEST_HANDLERS || {};

describe('useJournal extra', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // restore default mock implementations so hook destructuring works
    vi.mocked(api.useGetEntriesQuery).mockImplementation(
      (arg: any) => ({ data: [], isLoading: false, refetch: vi.fn() } as any),
    );
    vi.mocked(api.useGetStatsQuery).mockImplementation(
      () => ({ data: { total: 0, xp: 0 }, isLoading: false, refetch: vi.fn() } as any),
    );
    vi.mocked(api.useCreateEntryMutation).mockImplementation(
      () =>
        [
          vi.fn((d: any) => ({ unwrap: () => Promise.resolve({ ...d, id: 1 }) })),
          { isLoading: false },
        ] as any,
    );
    vi.mocked(api.useDeleteEntryMutation).mockImplementation(
      () =>
        [
          vi.fn((id: number | string) => ({ unwrap: () => Promise.resolve() })),
          { isLoading: false },
        ] as any,
    );
  });

  test('memoizes and passes filters to useGetEntriesQuery', () => {
    renderWithProviders(<Consumer filters={{ search: 'term', mood: 'happy', tag: 'x' }} />);
    const mocked = vi.mocked(api.useGetEntriesQuery);
    expect(mocked).toHaveBeenCalled();
    // first call arg should include provided filters
    const calledWith = mocked.mock.calls[0][0];
    expect(calledWith).toEqual({ search: 'term', mood: 'happy', tag: 'x' });
  });

  test('loadData calls refetch on entries and stats', async () => {
    const refetchEntries = vi.fn(() => Promise.resolve());
    const refetchStats = vi.fn(() => Promise.resolve());
    vi.mocked(api.useGetEntriesQuery).mockImplementation(
      () => ({ data: [], isLoading: false, refetch: refetchEntries } as any),
    );
    vi.mocked(api.useGetStatsQuery).mockImplementation(
      () => ({ data: { total: 0, xp: 0 }, isLoading: false, refetch: refetchStats } as any),
    );

    renderWithProviders(<Consumer />);
    await userEvent.click(screen.getByText('load'));
    expect(refetchEntries).toHaveBeenCalled();
    expect(refetchStats).toHaveBeenCalled();
  });

  test('createEntry calls mutation on success', async () => {
    const successFn = vi.fn((d: any) => ({ unwrap: () => Promise.resolve({ ...d, id: 9 }) }));
    vi.mocked(api.useCreateEntryMutation).mockImplementation(
      () => [successFn, { isLoading: false }] as any,
    );
    const { unmount } = renderWithProviders(<Consumer />);
    await userEvent.click(screen.getByText('create'));
    expect(successFn).toHaveBeenCalled();
    unmount();
  });

  test('createEntry calls mutation on failure', async () => {
    const failFn = vi.fn((d: any) => ({
      unwrap: async () => {
        throw new Error('create-fail');
      },
    }));
    vi.mocked(api.useCreateEntryMutation).mockImplementation(
      () => [failFn, { isLoading: false }] as any,
    );
    const { unmount } = renderWithProviders(<Consumer />);
    const handlers = (global as any).__TEST_HANDLERS;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    if (handlers && handlers.createEntry) {
      await handlers.createEntry({ title: 't', content: 'c', xp: 1 } as any).catch(() => {});
    }
    expect(failFn).toHaveBeenCalled();
    spy.mockRestore();
    unmount();
  });

  test('deleteEntry calls mutation on success', async () => {
    const okFn = vi.fn((id: any) => ({ unwrap: () => Promise.resolve() }));
    vi.mocked(api.useDeleteEntryMutation).mockImplementation(
      () => [okFn, { isLoading: false }] as any,
    );
    const { unmount } = renderWithProviders(<Consumer />);
    await userEvent.click(screen.getByText('del'));
    expect(okFn).toHaveBeenCalled();
    unmount();
  });

  test('deleteEntry calls mutation on failure', async () => {
    const errFn = vi.fn((id: any) => ({
      unwrap: async () => {
        throw new Error('del-fail');
      },
    }));
    vi.mocked(api.useDeleteEntryMutation).mockImplementation(
      () => [errFn, { isLoading: false }] as any,
    );
    const { unmount } = renderWithProviders(<Consumer />);
    const handlers = (global as any).__TEST_HANDLERS;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    if (handlers && handlers.deleteEntry) {
      await handlers.deleteEntry(5).catch(() => {});
    }
    expect(errFn).toHaveBeenCalled();
    spy.mockRestore();
    unmount();
  });

  test('refreshStats calls stats refetch and swallows errors', async () => {
    const refetchStats = vi.fn(() => Promise.reject(new Error('stat-err')));
    vi.mocked(api.useGetStatsQuery).mockImplementation(
      () => ({ data: { total: 0, xp: 0 }, isLoading: false, refetch: refetchStats } as any),
    );
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<Consumer />);
    await userEvent.click(screen.getByText('refresh'));
    expect(refetchStats).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

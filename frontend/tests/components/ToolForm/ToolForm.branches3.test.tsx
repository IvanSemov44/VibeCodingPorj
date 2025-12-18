import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { vi } from 'vitest';

// toast mock
const addToast = vi.fn();
vi.mock('../../../components/Toast', () => ({ useToast: () => ({ addToast }) }));

// mock react-query hooks used inside ToolForm (register mocks before importing module)
vi.mock('../../../store/domains', () => ({
  useCreateToolMutation: vi.fn(),
  useUpdateToolMutation: vi.fn(),
  useUploadToolScreenshotsMutation: vi.fn(),
  useGetTagsQuery: vi.fn(),
  useGetCsrfMutation: vi.fn(),
  useDeleteToolScreenshotMutation: vi.fn(),
}));

import ToolForm from '../../../components/ToolForm';
import * as domains from '../../../store/domains';

describe('ToolForm additional branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addToast.mockClear();
    (domains.useGetCsrfMutation as unknown as any).mockReturnValue([
      () => ({ unwrap: () => Promise.resolve() }),
      {},
    ]);

    (domains.useDeleteToolScreenshotMutation as unknown as any).mockReturnValue([
      () => ({ unwrap: () => Promise.resolve() }),
      {},
    ]);

    // Mock useGetTagsQuery to return empty data
    (domains.useGetTagsQuery as unknown as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  test('create path success without files shows created toast and calls onSaved', async () => {
    const mockCreateUnwrap = vi.fn().mockResolvedValue({ id: 11, name: 'New Tool' });
    const createFn = vi.fn().mockReturnValue({ unwrap: mockCreateUnwrap });
    (domains.useCreateToolMutation as unknown as any).mockReturnValue([
      createFn,
      { isLoading: false, error: null },
    ]);

    // ensure update/upload exist
    (domains.useUpdateToolMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (domains.useUploadToolScreenshotsMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const onSaved = vi.fn();
    const { container } = renderWithProviders(
      <ToolForm categories={[]} roles={[]} allTags={[]} onSaved={onSaved} />,
    );

    // fill required name field
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Tool' } });

    const btn = screen.getByText(/save tool/i);
    fireEvent.click(btn);

    await waitFor(() => expect(createFn).toHaveBeenCalled());
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.stringContaining('created'), 'success'),
    );
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 11 }));
  });

  test('update path failure surfaces error and sets error box', async () => {
    const mockUpdateUnwrap = vi.fn().mockRejectedValue(new Error('update-fail'));
    const updateFn = vi.fn().mockReturnValue({ unwrap: mockUpdateUnwrap });
    (domains.useUpdateToolMutation as unknown as any).mockReturnValue([
      updateFn,
      { isLoading: false, error: null },
    ]);

    // create/upload stubs
    (domains.useCreateToolMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (domains.useUploadToolScreenshotsMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { container } = renderWithProviders(
      <ToolForm initial={{ id: 22, name: 'Existing' }} categories={[]} roles={[]} allTags={[]} />,
    );

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Try Update' } });

    const btn = screen.getByText(/save tool/i);
    fireEvent.click(btn);

    await waitFor(() => expect(updateFn).toHaveBeenCalled());
    await waitFor(() => expect(addToast).toHaveBeenCalled());
    const matches = await screen.findAllByText(/update-fail/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

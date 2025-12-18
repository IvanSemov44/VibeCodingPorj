import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { vi } from 'vitest';

// provide a controllable toast mock
const addToast = vi.fn();
vi.mock('../../../components/Toast', () => ({ useToast: () => ({ addToast }) }));

// mock react-query hooks used inside ToolForm
vi.mock('../../../store/domains', () => ({
  useCreateToolMutation: vi.fn(),
  useUpdateToolMutation: vi.fn(),
  useUploadToolScreenshotsMutation: vi.fn(),
  useGetTagsQuery: vi.fn(),
  useGetCsrfMutation: vi.fn(),
  useDeleteToolScreenshotMutation: vi.fn(),
}));

import ToolForm from '../../../components/ToolForm';
import {
  useCreateToolMutation,
  useUpdateToolMutation,
  useUploadToolScreenshotsMutation,
  useGetCsrfMutation,
  useDeleteToolScreenshotMutation,
} from '../../../store/domains';

describe('ToolForm branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useGetCsrfMutation as unknown as any).mockReturnValue([
      () => ({ unwrap: () => Promise.resolve() }),
      {},
    ]);
    (useDeleteToolScreenshotMutation as unknown as any).mockReturnValue([
      () => ({ unwrap: () => Promise.resolve() }),
      {},
    ]);
  });

  test('update path uploads files and shows updated toast', async () => {
    const mockUpdateUnwrap = vi.fn().mockResolvedValue({ id: 99, name: 'Updated' });
    const updateFn = vi.fn().mockReturnValue({ unwrap: mockUpdateUnwrap });
    (useUpdateToolMutation as unknown as any).mockReturnValue([
      updateFn,
      { isLoading: false, error: null },
    ]);

    const mockUploadUnwrap = vi.fn().mockResolvedValue({ screenshots: ['a.png'] });
    const uploadFn = vi.fn().mockReturnValue({ unwrap: mockUploadUnwrap });
    (useUploadToolScreenshotsMutation as unknown as any).mockReturnValue([
      uploadFn,
      { isLoading: false, error: null },
    ]);

    // create hook must exist as well
    (useCreateToolMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const onSaved = vi.fn();

    const { container } = renderWithProviders(
      <ToolForm
        initial={{ id: 99, name: 'Updated' }}
        onSaved={onSaved}
        categories={[]}
        roles={[]}
        allTags={[]}
      />,
    );

    // attach a fake file to the file input
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    const file = new File(['hello'], 'screenshot.png', { type: 'image/png' });
    // fire change with files
    fireEvent.change(fileInput, { target: { files: [file] } });

    const btn = screen.getByText(/save tool/i);
    fireEvent.click(btn);

    await waitFor(() => expect(updateFn).toHaveBeenCalled());
    await waitFor(() => expect(uploadFn).toHaveBeenCalled());
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.stringContaining('updated'), 'success'),
    );
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
  });

  test('create path shows error message when mutation fails', async () => {
    const mockCreateUnwrap = vi.fn().mockRejectedValue(new Error('create-fail'));
    const createFn = vi.fn().mockReturnValue({ unwrap: mockCreateUnwrap });
    (useCreateToolMutation as unknown as any).mockReturnValue([
      createFn,
      { isLoading: false, error: null },
    ]);

    // ensure others exist
    (useUpdateToolMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (useUploadToolScreenshotsMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const { container } = renderWithProviders(<ToolForm categories={[]} roles={[]} allTags={[]} />);

    // fill required name field so the form will submit
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    fireEvent.change(nameInput, { target: { value: 'Failing Create' } });

    const btn = screen.getByText(/save tool/i);
    fireEvent.click(btn);

    await waitFor(() => expect(createFn).toHaveBeenCalled());
    await waitFor(() => expect(addToast).toHaveBeenCalled());
    // error box should be present (one or more occurrences)
    const matches = await screen.findAllByText(/create-fail/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

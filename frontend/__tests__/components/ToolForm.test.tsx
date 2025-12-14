import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { vi } from 'vitest';

// mock react-query hooks used inside ToolForm
vi.mock('../../store/api2', () => ({
  useCreateToolMutation: vi.fn(),
  useUpdateToolMutation: vi.fn(),
  useUploadToolScreenshotsMutation: vi.fn(),
  useGetTagsQuery: vi.fn(),
}));

// mock toast
vi.mock('../../components/Toast', () => ({ useToast: () => ({ addToast: vi.fn() }) }));

import ToolForm from '../../components/ToolForm';
import {
  useCreateToolMutation,
  useUpdateToolMutation,
  useUploadToolScreenshotsMutation,
} from '../../store/api2';

describe('ToolForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('submits create mutation when creating a new tool', async () => {
    const mockUnwrap = vi.fn().mockResolvedValue({ id: 42, name: 'My Tool' });
    const createFn = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    (useCreateToolMutation as unknown as any).mockReturnValue([
      createFn,
      { isLoading: false, error: null },
    ]);
    // ensure update/upload hooks exist so component destructuring doesn't fail
    (useUpdateToolMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);
    (useUploadToolScreenshotsMutation as unknown as any).mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null },
    ]);

    const onSaved = vi.fn();

    const { getByText } = renderWithProviders(
      <ToolForm
        initial={{ name: 'My Tool' }}
        onSaved={onSaved}
        categories={[]}
        roles={[]}
        allTags={[]}
      />,
    );

    const btn = getByText(/Save Tool/);
    fireEvent.click(btn);

    await waitFor(() => expect(createFn).toHaveBeenCalled());
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 42 })));
  });

  test('renders form with Save Tool button and NameField', () => {
    renderWithProviders(<ToolForm categories={[]} roles={[]} allTags={[]} />);

    expect(screen.getByText(/save tool/i)).toBeInTheDocument();
    expect(screen.getByText(/name \*/i)).toBeInTheDocument();
  });
});

import React from 'react';
console.log('DEBUG: ToolForm.test loaded');
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils';

// Mock api hooks and toast
vi.mock('../../components/Toast', () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock('../../store/api2', () => ({
  useCreateToolMutation: vi.fn(),
  useUpdateToolMutation: vi.fn(),
  useUploadToolScreenshotsMutation: vi.fn(),
  useGetTagsQuery: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}));

import ToolForm from '../../components/ToolForm';
import { waitFor } from '@testing-library/react';

describe('ToolForm', () => {
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

  it.skip('submits create flow and calls create trigger', async () => {
    const api = await import('../../store/api2');
    const createTrigger = vi.fn(() => ({ unwrap: () => Promise.resolve({ id: 123 }) }));
    vi.mocked(api.useCreateToolMutation).mockReturnValue([createTrigger, {}] as any);
    vi.mocked(api.useUpdateToolMutation).mockReturnValue([vi.fn(), {}] as any);
    vi.mocked(api.useUploadToolScreenshotsMutation).mockReturnValue([vi.fn(), {}] as any);

    renderWithProviders(<ToolForm allTags={['a', 'b']} categories={[]} roles={[]} />);

    // Fill a name field if present
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement | null;
    if (nameInput) {
      await userEvent.type(nameInput, 'My Tool');
    }

    const saveBtn = screen.getByRole('button', { name: /save tool/i });
    await userEvent.click(saveBtn);

    // wait for the create trigger to be called by the async submit flow
    await waitFor(() => {
      expect(createTrigger).toHaveBeenCalled();
    });
  });
});

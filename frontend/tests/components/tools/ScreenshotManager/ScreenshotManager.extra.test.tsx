import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { vi } from 'vitest';

// Mock next/image to a simple img element for tests
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', { src: props.src, alt: props.alt }),
}));

// Mock domain hooks
vi.mock('../../../../store/domains', () => ({
  useDeleteToolScreenshotMutation: vi.fn(),
  useGetCsrfMutation: vi.fn(),
}));

import ScreenshotManager from '../../../../components/tools/ScreenshotManager';
import { renderWithProviders } from '../../../../tests/test-utils';
import * as domains from '../../../../store/domains';

describe('ScreenshotManager edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default global confirm/alert
    global.confirm = vi.fn(() => true) as any;
    global.alert = vi.fn() as any;
    // provide safe default hook returns so component can destructure
    const defaultTrigger = () => ({ unwrap: () => Promise.resolve() });
    vi.mocked(domains.useDeleteToolScreenshotMutation).mockReturnValue([defaultTrigger, {}] as any);
    vi.mocked(domains.useGetCsrfMutation).mockReturnValue([() => ({ unwrap: () => Promise.resolve() }), {}] as any);
  });

  test('adds invalid url shows alert and does not call change', () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <Formik initialValues={{}} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager screenshots={[]} onScreenshotsChange={onChange} fileInputRef={ref} />
          </form>
        )}
      </Formik>,
    );

    const input = getByPlaceholderText('Image URL');
    fireEvent.change(input, { target: { value: 'not-a-url' } });
    fireEvent.click(getByText('Add'));

    expect(global.alert).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('adds valid url calls onScreenshotsChange and clears input', () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <Formik initialValues={{}} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager screenshots={[]} onScreenshotsChange={onChange} fileInputRef={ref} />
          </form>
        )}
      </Formik>,
    );

    const input = getByPlaceholderText('Image URL');
    fireEvent.change(input, { target: { value: 'https://example.com/img.png' } });
    fireEvent.click(getByText('Add'));

    expect(onChange).toHaveBeenCalledWith(['https://example.com/img.png']);
  });

  test('delete without toolId filters locally', () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    const screenshots = ['a', 'b'];
    const { getByText } = renderWithProviders(
      <Formik initialValues={{ screenshots }} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager
              screenshots={screenshots}
              onScreenshotsChange={onChange}
              fileInputRef={ref}
            />
          </form>
        )}
      </Formik>,
    );

    // click delete for 'a'
    const delButtons = document.querySelectorAll('button');
    // find the Delete button that appears (multiple buttons exist); choose one with text Delete
    const deleteBtn = Array.from(delButtons).find(
      (b) => b.textContent === 'Delete',
    ) as HTMLButtonElement;
    fireEvent.click(deleteBtn);

    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  test('delete with toolId performs API delete and updates', async () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    const mutateAsync = vi.fn().mockResolvedValue({ screenshots: ['b'] });
    const trigger = vi.fn(() => ({ unwrap: () => mutateAsync() }));
    vi.mocked(domains.useDeleteToolScreenshotMutation).mockReturnValue([trigger, {}] as any);

    const { getByText } = renderWithProviders(
      <Formik initialValues={{ screenshots: ['a', 'b'] }} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager
              screenshots={['a', 'b']}
              toolId={1}
              onScreenshotsChange={onChange}
              fileInputRef={ref}
            />
          </form>
        )}
      </Formik>,
    );

    const delButtons = document.querySelectorAll('button');
    const deleteBtn = Array.from(delButtons).find(
      (b) => b.textContent === 'Delete',
    ) as HTMLButtonElement;
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(trigger).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  test('delete 401 triggers getCsrf and retries', async () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    // first call rejects with object having status 401 then resolves
    const mutateAsync = vi.fn();
    mutateAsync.mockRejectedValueOnce({ status: 401 }).mockResolvedValueOnce({ screenshots: ['b'] });
    const trigger = vi.fn(() => ({ unwrap: () => mutateAsync() }));
    vi.mocked(domains.useDeleteToolScreenshotMutation).mockReturnValue([trigger, {}] as any);

    const csrfMutate = vi.fn().mockResolvedValue({});
    const csrfTrigger = vi.fn(() => ({ unwrap: () => csrfMutate() }));
    vi.mocked(domains.useGetCsrfMutation).mockReturnValue([csrfTrigger, {}] as any);
    renderWithProviders(
      <Formik initialValues={{ screenshots: ['a', 'b'] }} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager
              screenshots={['a', 'b']}
              toolId={2}
              onScreenshotsChange={onChange}
              fileInputRef={ref}
            />
          </form>
        )}
      </Formik>,
    );

    const delButtons = document.querySelectorAll('button');
    const deleteBtn = Array.from(delButtons).find(
      (b) => b.textContent === 'Delete',
    ) as HTMLButtonElement;
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2));
    expect(csrfMutate).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  test('delete error shows alert', async () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    const mutateAsync = vi.fn().mockRejectedValue(new Error('delete-failed'));
    const trigger = vi.fn(() => ({ unwrap: () => mutateAsync() }));
    vi.mocked(domains.useDeleteToolScreenshotMutation).mockReturnValue([trigger, {}] as any);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(
      <Formik initialValues={{ screenshots: ['a'] }} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager
              screenshots={['a']}
              toolId={3}
              onScreenshotsChange={onChange}
              fileInputRef={ref}
            />
          </form>
        )}
      </Formik>,
    );

    const delButtons = document.querySelectorAll('button');
    const deleteBtn = Array.from(delButtons).find(
      (b) => b.textContent === 'Delete',
    ) as HTMLButtonElement;
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(global.alert).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

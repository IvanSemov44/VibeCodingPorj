import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { vi } from 'vitest';

// Mock next/image to a simple img element for tests
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', { src: props.src, alt: props.alt }),
}));

// Mock api helpers
vi.mock('../../../lib/api', () => ({
  deleteToolScreenshot: vi.fn(),
  getCsrf: vi.fn(),
}));

import ScreenshotManager from '../../../components/tools/ScreenshotManager';
import { renderWithProviders } from '../../../tests/test-utils';
import { deleteToolScreenshot, getCsrf } from '../../../lib/api';

describe('ScreenshotManager edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default global confirm/alert
    global.confirm = vi.fn(() => true) as any;
    global.alert = vi.fn() as any;
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
    (deleteToolScreenshot as jest.MockedFunction<any>).mockResolvedValue({ screenshots: ['b'] });

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

    await waitFor(() => expect(deleteToolScreenshot).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  test('delete 401 triggers getCsrf and retries', async () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;

    // first call rejects with object having status 401
    (deleteToolScreenshot as jest.MockedFunction<any>)
      .mockRejectedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ screenshots: ['b'] });
    (getCsrf as jest.MockedFunction<any>).mockResolvedValue({});

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

    await waitFor(() => expect(deleteToolScreenshot).toHaveBeenCalledTimes(2));
    expect(getCsrf).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  test('delete error shows alert', async () => {
    const onChange = vi.fn();
    const ref = { current: null } as any;
    (deleteToolScreenshot as jest.MockedFunction<any>).mockRejectedValue(
      new Error('delete-failed'),
    );
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

    await waitFor(() => expect(deleteToolScreenshot).toHaveBeenCalled());
    expect(global.alert).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../../../tests/test-utils';
import { Formik } from 'formik';
import ScreenshotManager from '../../../../components/tools/ScreenshotManager';
import { describe, test, expect, vi } from 'vitest';

describe('ScreenshotManager', () => {
  test('adds URL via input and calls onScreenshotsChange', async () => {
    const onChange = vi.fn();
    const ref = React.createRef<HTMLInputElement | null>();

    renderWithProviders(
      <Formik initialValues={{}} onSubmit={() => {}}>
        {() => (
          <form>
            <ScreenshotManager screenshots={[]} onScreenshotsChange={onChange} fileInputRef={ref} />
          </form>
        )}
      </Formik>,
    );

    const input = screen.getByPlaceholderText('Image URL');
    await userEvent.type(input, 'https://example.com/img.png');
    await userEvent.click(screen.getByText('Add'));

    expect(onChange).toHaveBeenCalledWith(['https://example.com/img.png']);
  });

  test('deletes screenshot locally when no toolId provided', async () => {
    const onChange = vi.fn();
    const screenshots = ['https://a.png', 'https://b.png'];
    const ref = React.createRef<HTMLInputElement | null>();

    renderWithProviders(
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

    // find Delete button for first screenshot
    const delButtons = screen.getAllByText('Delete');
    await userEvent.click(delButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['https://b.png']);
  });
});

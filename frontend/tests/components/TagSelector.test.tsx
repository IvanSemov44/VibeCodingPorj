import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils';

// Partially mock react-query to preserve QueryClient and other exports
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...(actual as any),
    useQuery: () => ({ data: [{ id: 1, name: 'alpha' }], isLoading: false, isError: false }),
  } as any;
});

import TagSelector from '../../components/journal/components/TagSelector';

describe('TagSelector', () => {
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

  it('renders tags and calls onToggle', async () => {
    const onToggle = vi.fn();
    renderWithProviders(<TagSelector selectedTags={[]} onToggle={onToggle} />);

    const btn = screen.getByText('#alpha');
    expect(btn).toBeTruthy();
    await userEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith('alpha');
  });
});

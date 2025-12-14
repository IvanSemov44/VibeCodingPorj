import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../../tests/test-utils';

// Mock child components used by JournalForm to keep test focused
vi.mock('../../../components/journal/components/MoodSelector', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <button onClick={() => onChange('happy')}>mood:{value}</button>
  ),
}));

vi.mock('../../../components/journal/components/TagSelector', () => ({
  __esModule: true,
  default: ({ selectedTags, onToggle }: any) => (
    <button onClick={() => onToggle('tag1')}>tags</button>
  ),
}));

vi.mock('../../../components/journal/components/XPSlider', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <input aria-label="xp" value={value} onChange={(e: any) => onChange(Number(e.target.value))} />
  ),
}));

import JournalForm from '../../../components/journal/JournalForm';
import { vi, describe, test, expect } from 'vitest';

describe('JournalForm', () => {
  test('submits with filled fields and calls onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    renderWithProviders(
      <JournalForm onSubmit={onSubmit} onCancel={onCancel} submitting={false} error={''} />,
    );

    await userEvent.type(screen.getByPlaceholderText(/what did you accomplish/i), 'My Title');
    await userEvent.type(screen.getByPlaceholderText(/describe your journey/i), 'My content');
    await userEvent.click(screen.getByText(/tags/));

    await userEvent.click(screen.getByRole('button', { name: /save entry|saving/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});

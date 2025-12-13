import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import TagSelector from '../../components/journal/components/TagSelector';
import { vi, describe, test, expect } from 'vitest';

// Partially mock react-query to keep QueryClient available from the real module
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useQuery: () => ({ data: [{ id: 1, name: 'alpha' }, { id: 2, name: 'beta' }], isLoading: false, isError: false })
  };
});

describe('TagSelector', () => {
  test('renders tags and toggles', async () => {
    const onToggle = vi.fn();
    renderWithProviders(<TagSelector selectedTags={[]} onToggle={onToggle} />);
    expect(screen.getByText('#alpha')).toBeInTheDocument();
    await userEvent.click(screen.getByText('#alpha'));
    expect(onToggle).toHaveBeenCalledWith('alpha');
  });
});
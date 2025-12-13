import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import Button from '../../components/Button';
import { describe, test, vi, expect } from 'vitest';

describe('Button component', () => {
  test('renders children and handles click', async () => {
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();

    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  test('shows loading spinner and is disabled when loading', () => {
    const onClick = vi.fn();
    renderWithProviders(
      <Button onClick={onClick} loading>
        Loading
      </Button>
    );

    const btn = screen.getByRole('button', { name: /loading/i });
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.animate-spin')).toBeTruthy();
  });
});
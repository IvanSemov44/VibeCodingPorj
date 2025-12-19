import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render multiple children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>,
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>,
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          Click me
        </Button>,
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should call onClick multiple times', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent', 'text-white', 'hover:bg-accent-hover');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary-bg', 'text-primary-text', 'hover:bg-tertiary-bg');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'text-white', 'hover:bg-red-600');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-transparent',
        'text-primary-text',
        'border',
        'border-border',
        'hover:bg-secondary-bg',
      );
    });
  });

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2.5', 'text-sm');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-5', 'py-3', 'text-base');
    });
  });

  describe('Button Types', () => {
    it('should default to type="button"', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should support type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should support type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not be disabled when disabled prop is false', () => {
      render(<Button disabled={false}>Enabled</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-tertiary-bg', 'cursor-not-allowed', 'opacity-60');
    });
  });

  describe('Loading State', () => {
    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show loading spinner', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should apply loading styles', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-wait', 'bg-tertiary-bg', 'opacity-60');
    });

    it('should still show children when loading', () => {
      render(<Button loading>Loading Text</Button>);
      expect(screen.getByText('Loading Text')).toBeInTheDocument();
    });

    it('should not show spinner when not loading', () => {
      render(<Button>Not Loading</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      render(<Button>Normal</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('should be full width when fullWidth prop is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should accept aria-label', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('should accept data attributes', () => {
      render(<Button data-testid="custom-button">Button</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('should accept id attribute', () => {
      render(<Button id="my-button">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('id', 'my-button');
    });
  });

  describe('Complex Scenarios', () => {
    it('should combine variant and size correctly', () => {
      render(
        <Button variant="danger" size="lg">
          Large Danger
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'px-5', 'py-3');
    });

    it('should handle disabled and loading together', () => {
      render(
        <Button disabled loading>
          Disabled and Loading
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should apply all props together', () => {
      const handleClick = vi.fn();
      render(
        <Button
          variant="secondary"
          size="sm"
          type="submit"
          fullWidth
          onClick={handleClick}
          data-testid="complex-button"
        >
          Complex Button
        </Button>,
      );

      const button = screen.getByTestId('complex-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveClass('bg-secondary-bg', 'px-3', 'py-2', 'w-full');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have proper button role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should communicate disabled state to assistive tech', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('should have cursor styles that indicate interactivity', () => {
      render(<Button>Interactive</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-pointer');
    });

    it('should have cursor styles that indicate non-interactivity when disabled', () => {
      render(<Button disabled>Not Interactive</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Visual States', () => {
    it('should have base styles', () => {
      render(<Button>Base</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'border-none',
        'rounded-lg',
        'cursor-pointer',
        'font-semibold',
        'flex',
        'items-center',
        'justify-center',
        'gap-2',
        'transition-all',
        'duration-200',
      );
    });

    it('should have hover classes', () => {
      render(<Button>Hover</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent-hover');
    });
  });
});

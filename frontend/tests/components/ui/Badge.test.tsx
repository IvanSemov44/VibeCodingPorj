import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/render';
import Badge, { BadgeVariant, BadgeSize } from '@/components/ui/Badge';

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
    it('should render with children', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should render with default variant and size', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-block', 'rounded-xl', 'font-semibold', 'leading-tight');
    });

    it('should render multiple children', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>,
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants: BadgeVariant[] = ['default', 'primary', 'success', 'warning', 'error', 'purple'];

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        render(<Badge variant={variant}>{variant}</Badge>);
        expect(screen.getByText(variant)).toBeInTheDocument();
      });
    });

    it('should render default variant by default', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-[var(--bg-secondary)]', 'text-[var(--text-secondary)]');
    });

    it('should render primary variant', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-accent', 'text-white');
    });

    it('should render success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-[var(--alert-success-bg)]', 'text-[var(--alert-success-text)]');
    });

    it('should render warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-[var(--alert-warning-bg)]', 'text-[var(--alert-warning-text)]');
    });

    it('should render error variant', () => {
      const { container } = render(<Badge variant="error">Error</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-[var(--alert-error-bg)]', 'text-[var(--alert-error-text)]');
    });

    it('should render purple variant', () => {
      const { container } = render(<Badge variant="purple">Purple</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-[var(--accent-primary)]', 'text-white');
    });
  });

  describe('Sizes', () => {
    const sizes: BadgeSize[] = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      it(`should render ${size} size`, () => {
        render(<Badge size={size}>{size}</Badge>);
        expect(screen.getByText(size)).toBeInTheDocument();
      });
    });

    it('should render medium size by default', () => {
      const { container } = render(<Badge>Medium</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-xs');
    });

    it('should render small size', () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-[11px]');
    });

    it('should render large size', () => {
      const { container } = render(<Badge size="lg">Large</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-[13px]');
    });
  });

  describe('Children Content', () => {
    it('should render text content', () => {
      render(<Badge>Text Content</Badge>);
      expect(screen.getByText('Text Content')).toBeInTheDocument();
    });

    it('should render numeric content', () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render zero', () => {
      render(<Badge>{0}</Badge>);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render with React node children', () => {
      render(
        <Badge>
          <strong>Bold</strong> text
        </Badge>,
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText(/text/)).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
      render(
        <Badge>
          <span>🔥</span> Hot
        </Badge>,
      );
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText(/Hot/)).toBeInTheDocument();
    });

    it('should render empty string', () => {
      const { container } = render(<Badge></Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('');
    });
  });

  describe('Styling', () => {
    it('should have base classes', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-block', 'rounded-xl', 'font-semibold', 'leading-tight');
    });

    it('should apply inline-block display', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-block');
    });

    it('should have rounded corners', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('rounded-xl');
    });

    it('should have font-semibold', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('font-semibold');
    });

    it('should have leading-tight', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('leading-tight');
    });
  });

  describe('Complex Scenarios', () => {
    it('should combine variant and size correctly', () => {
      const { container } = render(
        <Badge variant="primary" size="lg">
          Large Primary
        </Badge>,
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-accent', 'text-white', 'px-3', 'py-1.5', 'text-[13px]');
    });

    it('should combine error variant with small size', () => {
      const { container } = render(
        <Badge variant="error" size="sm">
          Error
        </Badge>,
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass(
        'bg-[var(--alert-error-bg)]',
        'text-[var(--alert-error-text)]',
        'px-2',
        'py-0.5',
      );
    });

    it('should handle long text', () => {
      render(<Badge>This is a very long badge text that might wrap</Badge>);
      expect(screen.getByText(/This is a very long badge text/)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>NEW! 🎉</Badge>);
      expect(screen.getByText(/NEW! 🎉/)).toBeInTheDocument();
    });

    it('should render with nested elements', () => {
      render(
        <Badge variant="success" size="lg">
          <span className="icon">✓</span>
          <span className="text">Verified</span>
        </Badge>,
      );
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  describe('All Variant and Size Combinations', () => {
    it('should render all variant combinations with different sizes', () => {
      const variants: BadgeVariant[] = ['default', 'primary', 'success'];
      const sizes: BadgeSize[] = ['sm', 'md', 'lg'];

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          const { container } = render(
            <Badge variant={variant} size={size}>
              {variant}-{size}
            </Badge>,
          );
          const badge = container.firstChild as HTMLElement;
          expect(badge).toBeInTheDocument();
          expect(screen.getByText(`${variant}-${size}`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only content', () => {
      const { container } = render(<Badge>   </Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('   ');
    });

    it('should handle null in children ReactNode', () => {
      render(
        <Badge>
          Text {null} more text
        </Badge>,
      );
      expect(screen.getByText(/Text.*more text/)).toBeInTheDocument();
    });

    it('should handle boolean values in children', () => {
      render(
        <Badge>
          {true && 'Visible'}
          {false && 'Hidden'}
        </Badge>,
      );
      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      render(<Badge>{999999}</Badge>);
      expect(screen.getByText('999999')).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      render(<Badge>{-42}</Badge>);
      expect(screen.getByText('-42')).toBeInTheDocument();
    });

    it('should handle decimal numbers', () => {
      render(<Badge>{3.14}</Badge>);
      expect(screen.getByText('3.14')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as a status indicator', () => {
      render(<Badge variant="success">Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work as a notification count', () => {
      render(
        <Badge variant="error" size="sm">
          5
        </Badge>,
      );
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should work as a tag', () => {
      render(
        <Badge variant="purple" size="sm">
          Featured
        </Badge>,
      );
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('should work as a label', () => {
      render(
        <Badge variant="warning" size="md">
          Beta
        </Badge>,
      );
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });
  });
});

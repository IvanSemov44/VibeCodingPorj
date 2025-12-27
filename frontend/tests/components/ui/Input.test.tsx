import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import Input from '@/components/ui/Input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render as input element', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });

    it('should render with default type text', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have wrapper div with mb-4 class', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input onChange={handleChange} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('mb-4');
    });
  });

  describe('Label', () => {
    it('should not render label when not provided', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const label = screen.queryByRole('label');
      expect(label).not.toBeInTheDocument();
    });

    it('should render label when provided', () => {
      const handleChange = vi.fn();
      render(<Input label="Username" onChange={handleChange} />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should have correct label styling', () => {
      const handleChange = vi.fn();
      render(<Input label="Username" onChange={handleChange} />);
      const label = screen.getByText('Username').closest('label');
      expect(label).toHaveClass('block', 'text-sm', 'font-semibold', 'text-primary-text', 'mb-1.5');
    });

    it('should not show required indicator when required is false', () => {
      const handleChange = vi.fn();
      render(<Input label="Username" onChange={handleChange} required={false} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should show required indicator when required is true', () => {
      const handleChange = vi.fn();
      render(<Input label="Username" onChange={handleChange} required />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500', 'ml-1');
    });

    it('should show required indicator only with label', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} required />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Value and onChange', () => {
    it('should render with string value', () => {
      const handleChange = vi.fn();
      render(<Input value="test value" onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('should render with numeric value', () => {
      const handleChange = vi.fn();
      render(<Input value={42} onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    it('should render with empty string when value is undefined', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should call onChange when user types', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'new text' } });
      expect(handleChange).toHaveBeenCalledWith('new text');
    });

    it('should call onChange with string value', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: '123' } });
      expect(handleChange).toHaveBeenCalledWith('123');
      expect(typeof handleChange.mock.calls[0][0]).toBe('string');
    });

    it('should call onChange multiple times', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(handleChange).toHaveBeenCalledTimes(3);
      expect(handleChange.mock.calls[0][0]).toBe('a');
      expect(handleChange.mock.calls[1][0]).toBe('ab');
      expect(handleChange.mock.calls[2][0]).toBe('abc');
    });

    it('should handle controlled input updates', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Input value="initial" onChange={handleChange} />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      rerender(<Input value="updated" onChange={handleChange} />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('updated');
    });
  });

  describe('Error State', () => {
    it('should not show error when error is not provided', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should display error message when error is provided', () => {
      const handleChange = vi.fn();
      render(<Input error="This field is required" onChange={handleChange} />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should have correct error styling', () => {
      const handleChange = vi.fn();
      render(<Input error="Error message" onChange={handleChange} />);
      const errorDiv = screen.getByText('Error message');
      expect(errorDiv).toHaveClass('mt-1', 'text-xs', 'text-red-600');
    });

    it('should apply error border classes to input', () => {
      const handleChange = vi.fn();
      render(<Input error="Error" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500', 'focus:border-red-600');
    });

    it('should not show helper text when error is present', () => {
      const handleChange = vi.fn();
      render(<Input error="Error" helperText="Helper" onChange={handleChange} />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('should handle null error', () => {
      const handleChange = vi.fn();
      render(<Input error={null} onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-border', 'focus:border-accent');
    });
  });

  describe('Helper Text', () => {
    it('should not show helper text when not provided', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input onChange={handleChange} />);
      const helperText = container.querySelector('.text-secondary-text');
      expect(helperText).not.toBeInTheDocument();
    });

    it('should display helper text when provided', () => {
      const handleChange = vi.fn();
      render(<Input helperText="Enter your username" onChange={handleChange} />);
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
    });

    it('should have correct helper text styling', () => {
      const handleChange = vi.fn();
      render(<Input helperText="Helper text" onChange={handleChange} />);
      const helperDiv = screen.getByText('Helper text');
      expect(helperDiv).toHaveClass('mt-1', 'text-xs', 'text-secondary-text');
    });

    it('should handle null helper text', () => {
      const handleChange = vi.fn();
      render(<Input helperText={null} onChange={handleChange} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:opacity-60', 'disabled:cursor-not-allowed');
    });

    it('should have disabled attribute when disabled', () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('disabled');
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render email input', () => {
      const handleChange = vi.fn();
      render(<Input type="email" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      const handleChange = vi.fn();
      render(<Input type="password" onChange={handleChange} />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render number input', () => {
      const handleChange = vi.fn();
      render(<Input type="number" onChange={handleChange} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render url input', () => {
      const handleChange = vi.fn();
      render(<Input type="url" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render tel input', () => {
      const handleChange = vi.fn();
      render(<Input type="tel" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('Placeholder', () => {
    it('should not have placeholder by default', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('placeholder');
    });

    it('should render with placeholder', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Enter text" onChange={handleChange} />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should display placeholder when value is empty', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Enter text" value="" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Styling', () => {
    it('should have base input classes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'w-full',
        'px-3',
        'py-2',
        'bg-primary-bg',
        'border',
        'rounded-lg',
        'text-sm',
        'text-primary-text',
        'outline-none',
        'transition-colors',
      );
    });

    it('should have default border classes when no error', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-border', 'focus:border-accent');
    });

    it('should have error border classes when error exists', () => {
      const handleChange = vi.fn();
      render(<Input error="Error" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500', 'focus:border-red-600');
    });
  });

  describe('Additional Props', () => {
    it('should accept and apply custom props', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} data-testid="custom-input" maxLength={10} />);
      const input = screen.getByTestId('custom-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should accept id attribute', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} id="username-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'username-input');
    });

    it('should accept name attribute', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should accept autoComplete attribute', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    it('should accept aria-label', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} aria-label="Search input" />);
      const input = screen.getByLabelText('Search input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('should render complete input with all props', () => {
      const handleChange = vi.fn();
      render(
        <Input
          label="Email Address"
          type="email"
          value="test@example.com"
          onChange={handleChange}
          placeholder="Enter your email"
          helperText="We'll never share your email"
          required
        />,
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('should handle form submission scenario', () => {
      const handleChange = vi.fn();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Input label="Username" onChange={handleChange} required />
          <button type="submit">Submit</button>
        </form>,
      );

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      fireEvent.change(input, { target: { value: 'john' } });
      fireEvent.click(submitButton);

      expect(handleChange).toHaveBeenCalledWith('john');
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should switch between error and helper text', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Input helperText="Enter at least 8 characters" onChange={handleChange} />,
      );

      expect(screen.getByText('Enter at least 8 characters')).toBeInTheDocument();

      rerender(<Input error="Password is too short" helperText="Enter at least 8 characters" onChange={handleChange} />);

      expect(screen.getByText('Password is too short')).toBeInTheDocument();
      expect(screen.queryByText('Enter at least 8 characters')).not.toBeInTheDocument();
    });

    it('should handle password input with toggle visibility use case', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Input type="password" value="secret" onChange={handleChange} />);

      let input = document.querySelector('input[type="password"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('secret');

      rerender(<Input type="text" value="secret" onChange={handleChange} />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'text');
      expect(input.value).toBe('secret');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle zero as numeric value', () => {
      const handleChange = vi.fn();
      render(<Input value={0} onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    it('should handle negative numbers', () => {
      const handleChange = vi.fn();
      render(<Input value={-42} onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('-42');
    });

    it('should handle very long text', () => {
      const handleChange = vi.fn();
      const longText = 'a'.repeat(1000);
      render(<Input value={longText} onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(longText);
    });

    it('should handle special characters in value', () => {
      const handleChange = vi.fn();
      render(<Input value="!@#$%^&*()" onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('!@#$%^&*()');
    });

    it('should handle unicode characters', () => {
      const handleChange = vi.fn();
      render(<Input value="Hello 世界 🌍" onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Hello 世界 🌍');
    });

    it('should handle rapid onChange calls', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      for (let i = 0; i < 100; i++) {
        fireEvent.change(input, { target: { value: `text${i}` } });
      }

      expect(handleChange).toHaveBeenCalledTimes(100);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      input.focus();
      expect(input).toHaveFocus();
    });

    it('should support tab navigation', () => {
      const handleChange = vi.fn();
      render(
        <>
          <Input onChange={handleChange} />
          <Input onChange={handleChange} />
        </>,
      );

      const inputs = screen.getAllByRole('textbox');
      inputs[0].focus();
      expect(inputs[0]).toHaveFocus();
    });

    it('should have proper role', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should communicate disabled state to assistive tech', () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('disabled');
    });
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import Alert, { AlertType } from '@/components/ui/Alert';

describe('Alert Component', () => {
  describe('Basic Rendering', () => {
    it('should render with message', () => {
      render(<Alert message="Test alert message" />);
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
    });

    it('should render with default info type', () => {
      const { container } = render(<Alert message="Info message" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('alert-info');
    });

    it('should render with React node as message', () => {
      render(
        <Alert
          message={
            <div>
              <strong>Bold</strong> and <em>italic</em> text
            </div>
          }
        />,
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
      expect(screen.getByText(/and/)).toBeInTheDocument();
    });

    it('should render with multiple lines in message', () => {
      render(
        <Alert
          message={
            <>
              First line
              <br />
              Second line
            </>
          }
        />,
      );
      expect(screen.getByText(/First line/)).toBeInTheDocument();
      expect(screen.getByText(/Second line/)).toBeInTheDocument();
    });
  });

  describe('Alert Types', () => {
    const types: AlertType[] = ['success', 'error', 'warning', 'info'];

    types.forEach((type) => {
      it(`should render ${type} type with correct class`, () => {
        const { container } = render(<Alert type={type} message={`${type} message`} />);
        const alert = container.firstChild as HTMLElement;
        expect(alert).toHaveClass(`alert-${type}`);
      });
    });

    it('should render success alert with checkmark icon', () => {
      render(<Alert type="success" message="Success!" />);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should render error alert with X icon', () => {
      render(<Alert type="error" message="Error!" />);
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('should render warning alert with warning icon', () => {
      render(<Alert type="warning" message="Warning!" />);
      expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    it('should render info alert with info icon', () => {
      render(<Alert type="info" message="Info!" />);
      expect(screen.getByText('ℹ')).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should not render close button when onClose is not provided', () => {
      render(<Alert message="No close button" />);
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });

    it('should render close button when onClose is provided', () => {
      const handleClose = vi.fn();
      render(<Alert message="With close button" onClose={handleClose} />);
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(<Alert message="Closeable alert" onClose={handleClose} />);

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose multiple times when clicked multiple times', () => {
      const handleClose = vi.fn();
      render(<Alert message="Closeable alert" onClose={handleClose} />);

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(3);
    });

    it('should render close button as a button element', () => {
      const handleClose = vi.fn();
      render(<Alert message="Test" onClose={handleClose} />);

      const closeButton = screen.getByText('×');
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });

  describe('Styling and Layout', () => {
    it('should have flex layout classes', () => {
      const { container } = render(<Alert message="Test" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('flex', 'items-start', 'gap-3');
    });

    it('should have padding and border radius', () => {
      const { container } = render(<Alert message="Test" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('p-3', 'rounded-lg');
    });

    it('should have text size class', () => {
      const { container } = render(<Alert message="Test" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('text-sm');
    });

    it('should render icon with correct styling', () => {
      render(<Alert message="Test" />);
      const icon = screen.getByText('ℹ');
      expect(icon).toHaveClass('text-base', 'font-bold');
    });

    it('should have message in a flex-1 container', () => {
      render(<Alert message="Test message" />);
      const messageContainer = screen.getByText('Test message');
      expect(messageContainer).toHaveClass('flex-1');
    });
  });

  describe('Close Button Styling', () => {
    it('should have correct close button styling', () => {
      const handleClose = vi.fn();
      render(<Alert message="Test" onClose={handleClose} />);

      const closeButton = screen.getByText('×');
      expect(closeButton).toHaveClass(
        'bg-transparent',
        'border-none',
        'text-inherit',
        'cursor-pointer',
        'text-lg',
        'p-0',
        'leading-none',
        'transition-opacity',
        'hover:opacity-70',
      );
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle all props together', () => {
      const handleClose = vi.fn();
      const { container } = render(
        <Alert
          type="error"
          message={
            <div>
              <strong>Error:</strong> Something went wrong
            </div>
          }
          onClose={handleClose}
        />,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('alert-error');
      expect(screen.getByText('✕')).toBeInTheDocument(); // icon
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument(); // close button

      fireEvent.click(screen.getByText('×'));
      expect(handleClose).toHaveBeenCalled();
    });

    it('should handle long messages', () => {
      const longMessage =
        'This is a very long alert message that contains a lot of text and should still render properly without breaking the layout or causing any issues with the component.';
      render(<Alert message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle message with links', () => {
      render(
        <Alert
          message={
            <div>
              Click <a href="/test">here</a> for more info
            </div>
          }
        />,
      );

      const link = screen.getByText('here');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should handle message with lists', () => {
      render(
        <Alert
          message={
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          }
        />,
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render close button that is keyboard accessible', () => {
      const handleClose = vi.fn();
      render(<Alert message="Test" onClose={handleClose} />);

      const closeButton = screen.getByText('×');
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });

    it('should have cursor pointer on close button', () => {
      const handleClose = vi.fn();
      render(<Alert message="Test" onClose={handleClose} />);

      const closeButton = screen.getByText('×');
      expect(closeButton).toHaveClass('cursor-pointer');
    });

    it('should be identifiable by its message content', () => {
      render(<Alert message="Unique alert message" />);
      expect(screen.getByText('Unique alert message')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should display exactly one icon per alert', () => {
      render(<Alert type="success" message="Test" />);
      const icons = screen.getAllByText('✓');
      expect(icons).toHaveLength(1);
    });

    it('should display different icons for different types', () => {
      const { rerender } = render(<Alert type="success" message="Test" />);
      expect(screen.getByText('✓')).toBeInTheDocument();

      rerender(<Alert type="error" message="Test" />);
      expect(screen.getByText('✕')).toBeInTheDocument();
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string message', () => {
      render(<Alert message="" />);
      const alert = screen.getByText('ℹ').parentElement;
      expect(alert).toBeInTheDocument();
    });

    it('should handle numeric message', () => {
      render(<Alert message={<span>{42}</span>} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle null in message ReactNode', () => {
      render(
        <Alert
          message={
            <div>
              Text {null} more text
            </div>
          }
        />,
      );
      expect(screen.getByText(/Text.*more text/)).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import Input from '../../components/Input';

describe('Input component', () => {
  test('renders label and required marker', () => {
    const onChange = vi.fn();
    renderWithProviders(<Input label="Name" required onChange={onChange} />);

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('calls onChange when typing and shows helperText / error', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Input placeholder="Enter name" helperText="This is helper" onChange={onChange} />
    );

    const input = screen.getByPlaceholderText('Enter name');
    await userEvent.type(input, 'Alice');

    // onChange will be called for each keystroke; ensure final value reached
    const calls = (onChange as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1][0]).toBe('Alice');

    // helper text visible when no error
    expect(screen.getByText(/this is helper/i)).toBeInTheDocument();

    // rerender with error
    renderWithProviders(<Input placeholder="Enter name" error="Bad" onChange={onChange} />);
    expect(screen.getByText(/bad/i)).toBeInTheDocument();
  });
});

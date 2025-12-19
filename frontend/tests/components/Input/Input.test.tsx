import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../../tests/test-utils';
import Input from '../../../../components/ui/Input';
import { describe, test, vi, expect } from 'vitest';

describe('Input component', () => {
  test('renders label and required marker', () => {
    const onChange = vi.fn();
    renderWithProviders(<Input label="Name" required onChange={onChange} />);

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('calls onChange when typing and shows helperText / error', async () => {
    const spy = vi.fn();

    function Controlled() {
      const [val, setVal] = React.useState('');
      const handler = (v: string) => {
        spy(v);
        setVal(v);
      };
      return (
        <Input
          placeholder="Enter name"
          helperText="This is helper"
          value={val}
          onChange={handler}
        />
      );
    }

    renderWithProviders(<Controlled />);

    const input = screen.getByPlaceholderText('Enter name');
    await userEvent.type(input, 'Alice');

    // with a controlled wrapper the input value should update
    expect((input as HTMLInputElement).value).toBe('Alice');
    expect(spy).toHaveBeenCalled();

    // helper text visible when no error
    expect(screen.getByText(/this is helper/i)).toBeInTheDocument();

    // rerender with error (uncontrolled for error snapshot)
    renderWithProviders(<Input placeholder="Enter name" error="Bad" onChange={() => {}} />);
    expect(screen.getByText(/bad/i)).toBeInTheDocument();
  });
});

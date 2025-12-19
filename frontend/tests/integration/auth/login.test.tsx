import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/render';
import { server } from '../../msw/server';
import { rest } from 'msw';

// Mock login component for testing
const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8201/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div>Welcome back!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>
      {error && <div role="alert">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Sign In'}
      </button>
    </form>
  );
};

import React from 'react';

describe('Login Integration Flow', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Successful Login', () => {
    it('should login successfully with valid credentials', async () => {
      render(<LoginForm />);

      // Fill in the form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit the form
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    it('should login admin user successfully', async () => {
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'admin123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe('Failed Login', () => {
    it('should show error with invalid credentials', async () => {
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      });

      // Should not show success message
      expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      // Override handler to simulate network error
      server.use(
        rest.post('http://localhost:8201/api/login', (req, res) => {
          return res.networkError('Failed to connect');
        }),
      );

      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
      });
    });
  });

  describe('Form Validation', () => {
    it('should allow form submission with email and password', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should update input values on change', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'a' } });
      expect(emailInput.value).toBe('a');

      fireEvent.change(emailInput, { target: { value: 'ab' } });
      expect(emailInput.value).toBe('ab');

      fireEvent.change(emailInput, { target: { value: 'abc@test.com' } });
      expect(emailInput.value).toBe('abc@test.com');
    });
  });

  describe('UI States', () => {
    it('should show loading state during login', async () => {
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Button should show loading text
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    it('should disable button during loading', async () => {
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Button should be disabled during loading
      const loadingButton = screen.getByRole('button', { name: /logging in/i });
      expect(loadingButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    it('should clear previous errors on new submission', async () => {
      render(<LoginForm />);

      // First attempt with wrong credentials
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second attempt with correct credentials
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Error should be cleared and success shown
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe('MSW Integration', () => {
    it('should use mock API responses', async () => {
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // MSW should intercept the request and return mock data
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle custom MSW responses', async () => {
      // Override with custom response
      server.use(
        rest.post('http://localhost:8201/api/login', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: 'Server error' }),
          );
        }),
      );

      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/server error/i);
      });
    });
  });
});

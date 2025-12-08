import { useState } from 'react';
import { useRouter } from 'next/router';
import { getCsrf, register } from '../lib/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { useForm } from '../hooks/useForm';
import { ROUTES, VALIDATION } from '../lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  const {
    values,
    errors,
    handleChange,
    validate,
    setFieldError
  } = useForm(
    {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    },
    {
      name: {
        required: true,
        requiredMessage: 'Name is required'
      },
      email: {
        required: true,
        requiredMessage: 'Email is required',
        pattern: VALIDATION.EMAIL_PATTERN,
        patternMessage: 'Please enter a valid email'
      },
      password: {
        required: true,
        minLength: VALIDATION.PASSWORD_MIN_LENGTH,
        requiredMessage: 'Password is required',
        minLengthMessage: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
      },
      passwordConfirmation: {
        required: true,
        match: 'password',
        requiredMessage: 'Please confirm your password',
        matchMessage: 'Passwords do not match'
      }
    }
  );

  async function handleRegister(e) {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await getCsrf();
      await register(
        values.name,
        values.email,
        values.password,
        values.passwordConfirmation
      );

      // Successful registration - redirect to dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user:login'));
      }
      router.push('/dashboard');
    } catch (err) {
      // Handle Laravel validation errors
      const message = err.message || 'Registration failed';
      
      if (message.includes('email')) {
        setFieldError('email', 'This email is already registered');
      } else if (message.includes('password')) {
        setFieldError('password', message);
      } else {
        setGeneralError(message);
      }
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us and start building amazing projects"
      footerText="Already have an account?"
      footerLink={ROUTES.LOGIN}
      footerLinkText="Sign in"
    >
      <Card>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {generalError && (
            <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />
          )}

          <Input
            label="Full Name"
            type="text"
            value={values.name}
            onChange={(value) => handleChange('name', value)}
            error={errors.name}
            disabled={loading}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={values.email}
            onChange={(value) => handleChange('email', value)}
            error={errors.email}
            disabled={loading}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={values.password}
            onChange={(value) => handleChange('password', value)}
            error={errors.password}
            disabled={loading}
            placeholder="••••••••"
            helperText="Must be at least 8 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={values.passwordConfirmation}
            onChange={(value) => handleChange('passwordConfirmation', value)}
            error={errors.passwordConfirmation}
            disabled={loading}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            fullWidth
            size="lg"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}

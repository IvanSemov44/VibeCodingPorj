import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useGetCsrfMutation, useLoginMutation } from '../store/domains';
import { Card, Input, Button, Alert } from '../components/ui';
import AuthLayout from '../components/AuthLayout';
import { useForm } from '../hooks/useForm';
import { ROUTES } from '../lib/constants';

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { values, errors, handleChange, validate } = useForm<{ email: string; password: string }>(
    {
      email: 'ivan@admin.local',
      password: 'password',
    },
    {
      email: {
        required: true,
        requiredMessage: 'Email is required',
      },
      password: {
        required: true,
        requiredMessage: 'Password is required',
      },
    },
  );

  const [csrfTrigger] = useGetCsrfMutation();
  const [loginTrigger] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await csrfTrigger().unwrap();
      await loginTrigger({ email: values.email, password: values.password }).unwrap();
      // Successful login - redirect to dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user:login'));
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in (err as Record<string, unknown>)
          ? String((err as Record<string, unknown>).message)
          : String(err || 'Login failed');
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLink={ROUTES.REGISTER}
      footerLinkText="Create one"
    >
      <Card>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <Input
            label="Email Address"
            type="email"
            value={values.email}
            onChange={(value: string) => handleChange('email', value)}
            error={errors.email}
            disabled={loading}
            placeholder="john@example.com"
            required
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-sm text-primary-text">
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <a
                href="#"
                className="text-[13px] text-accent no-underline hover:text-accent-hover transition-colors"
              >
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              value={values.password}
              onChange={(value: string) => handleChange('password', value)}
              error={errors.password}
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" loading={loading} disabled={loading} fullWidth size="lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}

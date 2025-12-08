import { useState } from 'react';
import { useRouter } from 'next/router';
import { getCsrf, login } from '../lib/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { useForm } from '../hooks/useForm';
import { ROUTES } from '../lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    values,
    errors,
    handleChange,
    validate
  } = useForm(
    {
      email: 'ivan@admin.local',
      password: 'password'
    },
    {
      email: {
        required: true,
        requiredMessage: 'Email is required'
      },
      password: {
        required: true,
        requiredMessage: 'Password is required'
      }
    }
  );

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    
    try {
      await getCsrf();
      const res = await login(values.email, values.password);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }
      // Successful login - redirect to dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user:login'));
      }
      router.push('/dashboard');
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLink={ROUTES.REGISTER}
      footerLinkText="Create one"
    >
      <Card>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <Alert type="error" message={error} onClose={() => setError(null)} />
          )}

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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
                Password
                <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
              </label>
              <a href="#" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              value={values.password}
              onChange={(value) => handleChange('password', value)}
              error={errors.password}
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            fullWidth
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}

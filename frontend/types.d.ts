// Type definitions for improved IDE autocomplete
// This file provides type hints for JavaScript files

/**
 * Button component props
 */
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Input component props
 */
export interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}

/**
 * Alert component props
 */
export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

/**
 * Card component props
 */
export interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Badge component props
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AuthLayout component props
 */
export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
}

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

/**
 * LoadingPage component props
 */
export interface LoadingPageProps {
  message?: string;
}

/**
 * Validation rule object for useForm
 */
export interface ValidationRule {
  required?: boolean;
  requiredMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  match?: string;
  matchMessage?: string;
  custom?: (value: unknown, allValues: Record<string, unknown>) => string | null;
}

/**
 * useForm hook return type
 */
export interface UseFormReturn<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (field: string, value: unknown) => void;
  handleBlur: (field: string) => void;
  validate: () => boolean;
  reset: () => void;
  setFieldError: (field: string, message: string) => void;
  setErrors: (errors: Record<string, string>) => void;
}

/**
 * useAuth hook return type
 */
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
}

/**
 * useRedirectIfAuthenticated hook return type
 */
export interface UseRedirectIfAuthenticatedReturn {
  checking: boolean;
}

/**
 * useAsync hook options
 */
export interface UseAsyncOptions<T = unknown> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

/**
 * useAsync hook return type
 */
export interface UseAsyncReturn<T = unknown> {
  execute: (...args: unknown[]) => Promise<{ success: boolean; data?: T; error?: unknown }>;
  loading: boolean;
  error: unknown | null;
  data: T | null;
  reset: () => void;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  status: number;
  errors: Record<string, string | string[]>;
  constructor(message: string, status: number, errors?: Record<string, unknown>);
}

/**
 * User model
 */
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

/**
 * Role model
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
}

/**
 * API response type
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | Record<string, unknown[]>;
}

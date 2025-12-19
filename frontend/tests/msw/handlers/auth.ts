import { rest } from 'msw';
import { mockUser, mockAdminUser } from '../../fixtures';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

export const authHandlers = [
  // CSRF cookie
  rest.get(`${API_BASE_URL}/sanctum/csrf-cookie`, (req, res, ctx) => {
    return res(ctx.status(204), ctx.json({ message: 'CSRF cookie set' }));
  }),

  // Login
  rest.post(`${API_BASE_URL}/api/login`, async (req, res, ctx) => {
    const body = await req.json<LoginPayload>();
    const { email, password } = body;

    // Mock successful login for test users
    if (email === 'test@example.com' && password === 'password123') {
      const response: AuthResponse = {
        user: mockUser,
        token: 'mock-token-123',
      };
      return res(ctx.json(response));
    }

    if (email === 'admin@example.com' && password === 'admin123') {
      const response: AuthResponse = {
        user: mockAdminUser,
        token: 'mock-admin-token-123',
      };
      return res(ctx.json(response));
    }

    // Invalid credentials
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials', errors: { email: ['Invalid email or password'] } }),
    );
  }),

  // Register
  rest.post(`${API_BASE_URL}/api/register`, async (req, res, ctx) => {
    const body = await req.json<RegisterPayload>();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return res(
        ctx.status(422),
        ctx.json({
          message: 'Validation failed',
          errors: {
            name: !name ? ['Name is required'] : undefined,
            email: !email ? ['Email is required'] : undefined,
            password: !password ? ['Password is required'] : undefined,
          },
        }),
      );
    }

    // Mock user already exists
    if (email === 'existing@example.com') {
      return res(
        ctx.status(422),
        ctx.json({
          message: 'Validation failed',
          errors: { email: ['The email has already been taken'] },
        }),
      );
    }

    // Successful registration
    const newUser = {
      id: 999,
      name,
      email,
      roles: ['user'],
    };

    const response: AuthResponse = {
      user: newUser,
      token: 'mock-new-user-token',
    };

    return res(ctx.status(201), ctx.json(response));
  }),

  // Logout
  rest.post(`${API_BASE_URL}/api/logout`, (req, res, ctx) => {
    return res(ctx.json({ message: 'Logged out successfully' }));
  }),

  // Get current user
  rest.get(`${API_BASE_URL}/api/user`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');

    // Check if user is authenticated
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ message: 'Unauthenticated' }));
    }

    // Return mock user based on token
    const token = authHeader.replace('Bearer ', '');

    if (token === 'mock-admin-token-123') {
      return res(ctx.json(mockAdminUser));
    }

    if (token === 'mock-token-123' || token === 'mock-new-user-token') {
      return res(ctx.json(mockUser));
    }

    return res(ctx.status(401), ctx.json({ message: 'Unauthenticated' }));
  }),

  // Status endpoint
  rest.get(`${API_BASE_URL}/api/status`, (req, res, ctx) => {
    return res(ctx.json({ status: 'ok', timestamp: new Date().toISOString() }));
  }),
];

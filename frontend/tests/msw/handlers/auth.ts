import { http, HttpResponse } from 'msw';
import { mockUser, mockAdminUser } from '../../fixtures';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

export const authHandlers = [
  // CSRF cookie
  http.get(`${API_BASE_URL}/sanctum/csrf-cookie`, () => {
    return HttpResponse.json({ message: 'CSRF cookie set' }, { status: 204 });
  }),

  // Login
  http.post<never, LoginPayload>(`${API_BASE_URL}/api/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    // Mock successful login for test users
    if (email === 'test@example.com' && password === 'password123') {
      const response: AuthResponse = {
        user: mockUser,
        token: 'mock-token-123',
      };
      return HttpResponse.json(response);
    }

    if (email === 'admin@example.com' && password === 'admin123') {
      const response: AuthResponse = {
        user: mockAdminUser,
        token: 'mock-admin-token-123',
      };
      return HttpResponse.json(response);
    }

    // Invalid credentials
    return HttpResponse.json(
      { message: 'Invalid credentials', errors: { email: ['Invalid email or password'] } },
      { status: 401 },
    );
  }),

  // Register
  http.post<never, RegisterPayload>(`${API_BASE_URL}/api/register`, async ({ request }) => {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          errors: {
            name: !name ? ['Name is required'] : undefined,
            email: !email ? ['Email is required'] : undefined,
            password: !password ? ['Password is required'] : undefined,
          },
        },
        { status: 422 },
      );
    }

    // Mock user already exists
    if (email === 'existing@example.com') {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          errors: { email: ['The email has already been taken'] },
        },
        { status: 422 },
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

    return HttpResponse.json(response, { status: 201 });
  }),

  // Logout
  http.post(`${API_BASE_URL}/api/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  }),

  // Get current user
  http.get(`${API_BASE_URL}/api/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // Check if user is authenticated
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // Return mock user based on token
    const token = authHeader.replace('Bearer ', '');

    if (token === 'mock-admin-token-123') {
      return HttpResponse.json(mockAdminUser);
    }

    if (token === 'mock-token-123' || token === 'mock-new-user-token') {
      return HttpResponse.json(mockUser);
    }

    return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }),

  // Status endpoint
  http.get(`${API_BASE_URL}/api/status`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
];

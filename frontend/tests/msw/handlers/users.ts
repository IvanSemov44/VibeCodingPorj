import { rest } from 'msw';
import { mockUsers, mockUser, mockAdminUser } from '../../fixtures';
import type { User } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory users storage for testing
let users = [...mockUsers];

export const usersHandlers = [
  // Get users list (public)
  rest.get(`${API_BASE_URL}/api/users`, (req, res, ctx) => {
    return res(ctx.json({ data: users }));
  }),

  // Get single user
  rest.get(`${API_BASE_URL}/api/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find((u) => u.id === Number(id));

    if (!user) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }

    return res(ctx.json(user));
  }),

  // Update user profile
  rest.put(`${API_BASE_URL}/api/users/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json<Partial<User>>();
    const userIndex = users.findIndex((u) => u.id === Number(id));

    if (userIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...body,
    };

    users[userIndex] = updatedUser;

    return res(ctx.json(updatedUser));
  }),
];

// Helper to reset users to initial state (useful for tests)
export function resetUsers() {
  users = [...mockUsers];
}

import { http, HttpResponse } from 'msw';
import { mockUsers, mockUser, mockAdminUser } from '../../fixtures';
import type { User } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory users storage for testing
let users = [...mockUsers];

export const usersHandlers = [
  // Get users list (public)
  http.get(`${API_BASE_URL}/api/users`, () => {
    return HttpResponse.json({ data: users });
  }),

  // Get single user
  http.get(`${API_BASE_URL}/api/users/:id`, ({ params }) => {
    const { id } = params;
    const user = users.find((u) => u.id === Number(id));

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // Update user profile
  http.put<{ id: string }, Partial<User>>(
    `${API_BASE_URL}/api/users/:id`,
    async ({ params, request }) => {
      const { id } = params;
      const body = await request.json();
      const userIndex = users.findIndex((u) => u.id === Number(id));

      if (userIndex === -1) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Update user
      const updatedUser = {
        ...users[userIndex],
        ...body,
      };

      users[userIndex] = updatedUser;

      return HttpResponse.json(updatedUser);
    },
  ),
];

// Helper to reset users to initial state (useful for tests)
export function resetUsers() {
  users = [...mockUsers];
}

import type { User, AdminUser, Role } from '@/lib/types';

// Roles
export const mockRoleUser: Role = {
  id: 1,
  name: 'user',
};

export const mockRoleAdmin: Role = {
  id: 2,
  name: 'admin',
};

export const mockRoleModerator: Role = {
  id: 3,
  name: 'moderator',
};

// Regular users
export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  roles: ['user'],
};

export const mockUser2: User = {
  id: 2,
  name: 'Jane Doe',
  email: 'jane@example.com',
  roles: ['user'],
};

export const mockUser3: User = {
  id: 3,
  name: 'John Smith',
  email: 'john@example.com',
  roles: ['user'],
};

// Admin user
export const mockAdminUser: User = {
  id: 10,
  name: 'Admin User',
  email: 'admin@example.com',
  roles: ['admin', 'user'],
};

// Moderator user
export const mockModeratorUser: User = {
  id: 11,
  name: 'Moderator User',
  email: 'moderator@example.com',
  roles: ['moderator', 'user'],
};

// Admin user with full details
export const mockAdminUserFull: AdminUser = {
  id: 10,
  name: 'Admin User',
  email: 'admin@example.com',
  roles: [mockRoleAdmin, mockRoleUser],
  is_active: true,
  email_verified_at: '2024-01-01T00:00:00Z',
};

// Inactive admin user
export const mockInactiveAdminUser: AdminUser = {
  id: 12,
  name: 'Inactive Admin',
  email: 'inactive@example.com',
  roles: [mockRoleAdmin, mockRoleUser],
  is_active: false,
  email_verified_at: null,
};

// Collection of users
export const mockUsers: User[] = [
  mockUser,
  mockUser2,
  mockUser3,
  mockModeratorUser,
  mockAdminUser,
];

// Collection of admin users
export const mockAdminUsers: AdminUser[] = [
  mockAdminUserFull,
  mockInactiveAdminUser,
];

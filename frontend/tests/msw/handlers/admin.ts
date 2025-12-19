import { rest } from 'msw';
import { mockAdminUsers, mockPendingTools, mockTools } from '../../fixtures';
import type { AdminUser, AdminStats, Activity } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// Mock admin stats
const mockAdminStats: AdminStats = {
  totalTools: mockTools.length,
  pendingTools: mockPendingTools.length,
  approvedTools: mockTools.filter((t) => t.status === 'approved').length,
  rejectedTools: mockTools.filter((t) => t.status === 'rejected').length,
  activeUsers: mockAdminUsers.filter((u) => u.is_active).length,
  totalUsers: mockAdminUsers.length,
  totalCategories: 6,
  totalTags: 7,
  recentTools: mockTools.slice(0, 5).map((tool) => ({
    id: tool.id,
    title: tool.name || 'Untitled',
    slug: tool.slug || '',
    user: {
      name: tool.author_name || null,
      id: tool.user?.id || null,
    },
    created_at: '2024-01-01T00:00:00Z',
  })),
};

// Mock activity log
const mockActivities: Activity[] = [
  {
    id: 1,
    subject_type: 'Tool',
    subject_id: 1,
    action: 'created',
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user'],
    },
    meta: {},
    created_at: '2024-01-01T00:00:00Z',
    created_at_human: '2 hours ago',
  },
  {
    id: 2,
    subject_type: 'Tool',
    subject_id: 2,
    action: 'approved',
    user: {
      id: 10,
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['admin', 'user'],
    },
    meta: { status: 'approved' },
    created_at: '2024-01-01T01:00:00Z',
    created_at_human: '1 hour ago',
  },
];

export const adminHandlers = [
  // Get admin dashboard stats
  rest.get(`${API_BASE_URL}/api/admin/stats`, (req, res, ctx) => {
    return res(ctx.json(mockAdminStats));
  }),

  // Get all users (admin)
  rest.get(`${API_BASE_URL}/api/admin/users`, (req, res, ctx) => {
    return res(ctx.json({ data: mockAdminUsers }));
  }),

  // Ban/unban user
  rest.post(`${API_BASE_URL}/api/admin/users/:id/ban`, (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ message: `User ${id} banned successfully` }));
  }),

  rest.post(`${API_BASE_URL}/api/admin/users/:id/unban`, (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ message: `User ${id} unbanned successfully` }));
  }),

  // Approve/reject tools
  rest.post(`${API_BASE_URL}/api/admin/tools/:id/approve`, (req, res, ctx) => {
    const { id } = req.params;
    const tool = mockTools.find((t) => t.id === Number(id));

    if (!tool) {
      return res(ctx.status(404), ctx.json({ message: 'Tool not found' }));
    }

    return res(
      ctx.json({
        ...tool,
        status: 'approved',
        is_approved: true,
        is_pending: false,
      }),
    );
  }),

  rest.post(`${API_BASE_URL}/api/admin/tools/:id/reject`, (req, res, ctx) => {
    const { id } = req.params;
    const tool = mockTools.find((t) => t.id === Number(id));

    if (!tool) {
      return res(ctx.status(404), ctx.json({ message: 'Tool not found' }));
    }

    return res(
      ctx.json({
        ...tool,
        status: 'rejected',
        is_approved: false,
        is_pending: false,
      }),
    );
  }),

  // Get pending tools
  rest.get(`${API_BASE_URL}/api/admin/tools/pending`, (req, res, ctx) => {
    return res(ctx.json({ data: mockPendingTools }));
  }),

  // Get activity log
  rest.get(`${API_BASE_URL}/api/admin/activity`, (req, res, ctx) => {
    return res(ctx.json({ data: mockActivities }));
  }),
];

/**
 * Dashboard feature constants
 * Configuration for role colors, titles, content, and dashboard data
 */

import type { BadgeVariant } from '../types';

export const ROLE_COLORS: Record<string, BadgeVariant> = {
  owner: 'error',
  backend: 'primary',
  frontend: 'success',
  pm: 'purple',
  qa: 'warning',
  designer: 'purple'
} as const;

export const ROLE_TITLES: Record<string, string> = {
  owner: 'Admin Dashboard',
  backend: 'Backend Tasks',
  frontend: 'Frontend Tasks',
  pm: 'Project Management',
  qa: 'Quality Assurance',
  designer: 'Design Tasks'
} as const;

export const ROLE_CONTENT: Record<string, string> = {
  owner: 'You have full system access. Monitor team activity, manage users, and configure system settings.',
  backend: 'Focus on API development, database optimization, and server infrastructure. 3 pending code reviews.',
  frontend: 'Work on UI components, responsive design, and user experience improvements. 5 features in progress.',
  pm: 'Oversee project timelines, coordinate team efforts, and ensure deliverables meet requirements. 2 projects need updates.',
  qa: 'Review test cases, report bugs, and ensure quality standards. 7 issues awaiting verification.',
  designer: 'Create mockups, refine UI/UX, and maintain design systems. 4 design reviews scheduled.'
} as const;

// Dashboard stat interface
export interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

// Mock data for dashboard stats
export const MOCK_STATS: DashboardStat[] = [
  { label: 'Active Projects', value: 8, icon: '📁', color: '#3b82f6' },
  { label: 'Tasks Completed', value: 42, icon: '✓', color: '#10b981' },
  { label: 'Team Members', value: 15, icon: '👥', color: '#8b5cf6' },
];

// Activity item interface
export interface Activity {
  icon: string;
  text: string;
  time: string;
  color: string;
}

// Mock data for recent activity
export const MOCK_ACTIVITIES: Activity[] = [
  { icon: '✓', text: 'Completed task: Update documentation', time: '2 hours ago', color: '#10b981' },
  { icon: '💬', text: 'New comment on Design Review', time: '5 hours ago', color: '#3b82f6' },
  { icon: '📁', text: 'Created project: Mobile App v2', time: 'Yesterday', color: '#8b5cf6' },
];

// Quick action interface
export interface QuickAction {
  icon: string;
  label: string;
  href?: string;
}

// Quick actions list
export const QUICK_ACTIONS: QuickAction[] = [
  { icon: '📝', label: 'Create New Project', href: '#' },
  { icon: '📊', label: 'View Reports', href: '#' },
  { icon: '⚙️', label: 'Settings', href: '#' },
  { icon: '👥', label: 'Manage Team', href: '#' },
];

// Helper functions
export function getRoleTitle(roles: string[] | undefined): string {
  if (!roles || roles.length === 0) return 'Getting Started';
  const role = typeof roles[0] === 'string' ? roles[0] : '';
  return ROLE_TITLES[role] || 'Your Tasks';
}

export function getRoleContent(roles: string[] | undefined): string {
  if (!roles || roles.length === 0) {
    return 'Welcome! Get started by exploring your dashboard and completing your profile.';
  }
  const role = typeof roles[0] === 'string' ? roles[0] : '';
  return ROLE_CONTENT[role] || 'Complete your tasks and collaborate with your team to achieve project goals.';
}

export function getRoleColor(role: string): BadgeVariant {
  return ROLE_COLORS[role] || 'default';
}

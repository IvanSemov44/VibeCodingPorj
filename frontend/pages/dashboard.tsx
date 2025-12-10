import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { LoadingPage } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import JournalSection from '../components/JournalSection';
import type { BadgeVariant } from '../types.d';

export default function DashboardPage(): React.ReactElement | null {
  const { user, loading } = useAuth(true);

  if (loading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  if (!user) return null;

  const roleColors: Record<string, BadgeVariant> = {
    owner: 'error',
    backend: 'primary',
    frontend: 'success',
    pm: 'purple',
    qa: 'warning',
    designer: 'purple'
  };

  const stats = [
    { label: 'Active Projects', value: 8, icon: '📁', color: '#3b82f6' },
    { label: 'Tasks Completed', value: 42, icon: '✓', color: '#10b981' },
    { label: 'Team Members', value: 15, icon: '👥', color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back, {user.name}! 👋
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: 'var(--text-secondary)' }}>
          Here is what is happening with your projects today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
              </div>
              <div style={{ 
                fontSize: 36, 
                width: 64, 
                height: 64, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: `${stat.color}15`,
                borderRadius: 12
              }}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card title="Profile Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Name</div>
              <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Roles</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((roleName: string) => (
                    <Badge key={roleName} variant={(roleColors[roleName] || 'default')}>
                      {roleName}
                    </Badge>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-tertiary)' }}>No roles assigned</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ActionButton icon="📝" label="Create New Project" />
            <ActionButton icon="📊" label="View Reports" />
            <ActionButton icon="⚙️" label="Settings" />
            <ActionButton icon="👥" label="Manage Team" />
          </div>
        </Card>

        <Card title="Recent Activity" footer={<a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: 13 }}>View all activity →</a>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ActivityItem 
              icon="✓" 
              text="Completed task: Update documentation" 
              time="2 hours ago"
              color="#10b981"
            />
            <ActivityItem 
              icon="💬" 
              text="New comment on Design Review" 
              time="5 hours ago"
              color="#3b82f6"
            />
            <ActivityItem 
              icon="📁" 
              text="Created project: Mobile App v2" 
              time="Yesterday"
              color="#8b5cf6"
            />
          </div>
        </Card>

        <Card title={getRoleTitle(user.roles)}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {getRoleContent(user.roles)}
          </div>
        </Card>

      </div>

      <JournalSection />
    </div>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }): React.ReactElement {
  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-primary)',
      transition: 'all 0.2s',
      textAlign: 'left',
      width: '100%'
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)';
      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ActivityItem({ icon, text, time, color }: { icon: string; text: string; time: string; color: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{text}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{time}</div>
      </div>
    </div>
  );
}

function getRoleTitle(roles: string[] | undefined): string {
  if (!roles || roles.length === 0) return 'Getting Started';
  const role = typeof roles[0] === 'string' ? roles[0] : '';
  const titles: Record<string, string> = {
    owner: 'Admin Dashboard',
    backend: 'Backend Tasks',
    frontend: 'Frontend Tasks',
    pm: 'Project Management',
    qa: 'Quality Assurance',
    designer: 'Design Tasks'
  };
  return titles[role] || 'Your Tasks';
}

function getRoleContent(roles: string[] | undefined): string {
  if (!roles || roles.length === 0) return 'Welcome! Get started by exploring your dashboard and completing your profile.';
  const role = typeof roles[0] === 'string' ? roles[0] : '';
  const content: Record<string, string> = {
    owner: 'You have full system access. Monitor team activity, manage users, and configure system settings.',
    backend: 'Focus on API development, database optimization, and server infrastructure. 3 pending code reviews.',
    frontend: 'Work on UI components, responsive design, and user experience improvements. 5 features in progress.',
    pm: 'Oversee project timelines, coordinate team efforts, and ensure deliverables meet requirements. 2 projects need updates.',
    qa: 'Review test cases, report bugs, and ensure quality standards. 7 issues awaiting verification.',
    designer: 'Create mockups, refine UI/UX, and maintain design systems. 4 design reviews scheduled.'
  };
  return content[role] || 'Complete your tasks and collaborate with your team to achieve project goals.';
}

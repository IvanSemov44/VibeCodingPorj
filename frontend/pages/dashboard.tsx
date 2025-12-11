/**
 * Dashboard Page
 * Main dashboard view with user stats, profile, and quick actions
 * Refactored to use sub-components for better organization
 */

import React from 'react';
import { LoadingPage } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import JournalSection from '../components/JournalSection';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatsGrid from '../components/dashboard/StatsGrid';
import ProfileCard from '../components/dashboard/ProfileCard';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import RoleCard from '../components/dashboard/RoleCard';
import { MOCK_STATS } from '../lib/constants';

export default function DashboardPage(): React.ReactElement | null {
  const { user, loading } = useAuth(true);

  if (loading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  if (!user) return null;

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <WelcomeHeader userName={user.name} />

      <StatsGrid stats={MOCK_STATS} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <ProfileCard user={user} />
        <QuickActions />
        <ActivityFeed />
        <RoleCard roles={user.roles} />
      </div>

      <JournalSection />
    </div>
  );
}

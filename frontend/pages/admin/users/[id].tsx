import React from 'react';
import { useRouter } from 'next/router';
import UserTwoFactorManager from '../../../components/admin/UserTwoFactorManager';
// AdminGuard removed: rely on Next middleware for server-side protection

export default function AdminUserPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <div>Loading...</div>;

  return (
    <div>
      <h2>Admin: User {id}</h2>
      <UserTwoFactorManager userId={String(id)} />
    </div>
  );
}

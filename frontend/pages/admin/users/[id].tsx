import React from 'react';
import { useRouter } from 'next/router';
import UserTwoFactorManager from '../../../components/admin/UserTwoFactorManager';
import AdminGuard from '../../../components/admin/AdminGuard';

export default function AdminUserPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <div>Loading...</div>;

  return (
    <AdminGuard>
      <div>
        <h2>Admin: User {id}</h2>
        <UserTwoFactorManager userId={String(id)} />
      </div>
    </AdminGuard>
  );
}

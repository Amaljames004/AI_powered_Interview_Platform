'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/authGuard/authGuard';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/candidate/dashboard');
  }, [router]);

  return (
    <AuthGuard allowedRoles={['candidate']}>
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Redirecting to candidate dashboard...
      </div>
    </AuthGuard>
  );
}

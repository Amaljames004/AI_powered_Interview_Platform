'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

export default function AuthGuard({ children, allowedRoles = [] }) {
  const { authToken, user, loading } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !loading) {
      if (!authToken) {
        // Not logged in → go to login
        router.replace('/');
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Logged in but wrong role → go to home
        router.replace('/');
      }
    }
  }, [authToken, user, loading, hasMounted, router, allowedRoles]);

  if (!hasMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return children;
}

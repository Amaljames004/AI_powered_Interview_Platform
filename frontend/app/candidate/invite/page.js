'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import api from '@/utils/axios';


export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authToken, user, loading } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Processing invite link...');
  const appliedRef = useRef(false);

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const token = searchParams.get('token');
    if (!token) {
      setStatusMessage('❌ Invalid invite link.');
      return;
    }

    localStorage.setItem('inviteToken', token);

    if (!authToken || !user) {
      // Redirect to login with proper args
      router.push(`/login?redirect=/candidate/invite&token=${token}`);
      return;
    }

    if (user.role === 'recruiter') {
      setStatusMessage('⚠️ Only candidates can accept invitations.');
      return;
    }

    if (user.role === 'candidate') {
      if (appliedRef.current) return;
      appliedRef.current = true;

      const applyInvite = async () => {
        try {
          await api.post(`/application/applyy/${token}`);
          setStatusMessage('✅ Successfully applied! Redirecting to dashboard...');
          localStorage.removeItem('inviteToken');
          setTimeout(() => router.push('/candidate/dashboard'), 1500);
        } catch (err) {
          console.error('❌ Invite apply failed:', err.response?.data || err.message);
          setStatusMessage(`❌ Failed to apply: ${err.response?.data?.message || 'Server error'}`);
        }
      };

      applyInvite();
    }
  }, [authToken, user, loading, searchParams, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-center text-lg">{statusMessage}</p>
    </div>
  );
}

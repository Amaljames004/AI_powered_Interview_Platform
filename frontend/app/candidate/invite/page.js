'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import api from '@/utils/axios';

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authToken, user } = useAuth();

  const [statusMessage, setStatusMessage] = useState('Processing invite link...');
  const appliedRef = useRef(false); // ✅ prevent multiple calls

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatusMessage('❌ Invalid invite link.');
      return;
    }

    // Save token temporarily
    localStorage.setItem('inviteToken', token);

    // Require login first
    if (!authToken || !user) {
      setStatusMessage('🔐 Please log in to continue.');
      return;
    }

    // Ensure only candidate users can apply
    if (user.role !== 'candidate') {
      setStatusMessage('⚠️ You do not have permission to apply for this invite.');
      return;
    }

    // ✅ Prevent multiple API calls
    if (appliedRef.current) return;
    appliedRef.current = true;

    const applyInvite = async () => {
      try {
        const res = await api.post(`/application/applyy/${token}`);
        console.log('✅ Applied via invite:', res.data);

        setStatusMessage('✅ Successfully applied! Redirecting to dashboard...');
        localStorage.removeItem('inviteToken');

        // Redirect to candidate dashboard after success
        setTimeout(() => router.push('/candidate/dashboard'), 1500);
      } catch (err) {
        console.error('❌ Invite apply failed:', err.response?.data || err.message);
        setStatusMessage(
          `❌ Failed to apply: ${err.response?.data?.message || 'Server error'}`
        );
      }
    };

    applyInvite();
  }, [authToken, user]); // ✅ only rerun when auth changes (not searchParams/router)

  return <p className="text-center text-lg mt-10">{statusMessage}</p>;
}

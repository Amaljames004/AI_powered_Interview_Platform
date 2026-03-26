'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import api from '@/utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect invite token in URL and save to localStorage
  useEffect(() => {
    const inviteToken = searchParams.get('token');
    if (inviteToken) {
      localStorage.setItem('inviteToken', inviteToken);
      console.log('Invite detected and saved:', inviteToken);
    }
  }, [searchParams]);

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      // Save token & user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Handle candidate invite if exists
      if (user.role === 'candidate') {
        const inviteToken = localStorage.getItem('inviteToken');
        if (inviteToken) {
          try {
            await api.post(`/application/applyy/${inviteToken}`);
            console.log('Applied via invite');

            // Clear invite token after applying
            localStorage.removeItem('inviteToken');
          } catch (err) {
            // Silently ignore invite errors
            console.log('No valid invite to apply or already applied.');
            localStorage.removeItem('inviteToken');
          }
        }

        // Candidate profile completeness check
        try {
          const check = await api.get('/candidate/check-profile');
          if (!check.data.complete) {
            router.push('/candidate-profile-setup');
            return;
          }
          router.push('/candidate/dashboard');
        } catch (err) {
          console.error('Candidate profile check failed', err);
          router.push('/candidate-profile-setup');
        }
      } else if (user.role === 'recruiter') {
        try {
          const check = await api.get('/company-profile/check-profile');
          if (!check.data.complete) {
            router.push('/recruiter-profile-setup');
            return;
          }
          router.push('/recruiter/dashboard');
        } catch (err) {
          console.error('Company profile check failed', err);
          router.push('/recruiter-profile-setup');
        }
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('inviteToken');
    setAuthToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ authToken, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

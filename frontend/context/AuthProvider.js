'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  // ✅ login with profile completeness check
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Role-based routing with profile completeness checks
      if (user.role === 'candidate') {
        try {
          const check = await api.get('/candidate/check-profile');
          if (!check.data.complete) {
            router.push('/candidate-profile-setup');
            return;
          }
          router.push('/candidate/dashboard');
        } catch (err) {
          console.error("Candidate profile check failed", err);
          router.push('/candidate-profile-setup'); // fallback
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
          console.error("Company profile check failed", err);
          router.push('/recruiter-profile-setup'); // fallback
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

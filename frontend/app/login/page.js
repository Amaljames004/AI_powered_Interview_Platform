'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axios';

import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthProvider';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth(); // From AuthProvider

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(form.email, form.password); // calls login from AuthProvider
      
      const redirect = searchParams.get('redirect');
      const token = searchParams.get('token');
      if (redirect && token) {
        router.push(`${redirect}?token=${token}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
     <header className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 rounded-md bg-[#121211] flex items-center justify-center text-white font-bold">
              SH
            </div>
            <span className="text-xl font-bold tracking-tight">SkillHire AI</span>
          </motion.div>
          <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
           
          </nav>
        </div>
      </header>
    <div className="min-h-screen flex items-center justify-center bg-[#FDEBD3] py-12 px-4 sm:px-6 lg:px-8">
    
      {/* Login Card */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="w-full max-w-md "
>
  <form
    onSubmit={handleSubmit}
    className=" bg-white rounded-3xl p-8 mx-auto border border-gray-700  hover:shadow-2xl transition-all duration-300"
  >
    <div className="text-center mb-8">
      
      <h3 className="text-3xl font-bold text-gray-900">
        Welcome to SkillHire
      </h3>
      <p className="text-gray-500 mt-2">Sign in to continue your journey</p>
    </div>

   

    {error && (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 text-red-600 text-sm font-medium bg-red-50 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </motion.div>
    )}

    <div className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Your Email 
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] focus:border-transparent outline-none transition placeholder-gray-400"
          placeholder="yourMail@gmail.com"
        />
      </div>

      

      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <a href="#" className="text-xs text-[#121211] font-medium hover:underline">
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] focus:border-transparent outline-none transition placeholder-gray-400"
          placeholder="Enter your password"
        />
      </div>

      
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 text-[#121211] focus:ring-[#121211] border-gray-300 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Remember my login
          </label>
        </div>
      

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.01 } : {}}
        whileTap={!isLoading ? { scale: 0.99 } : {}}
        className={`w-full py-3.5 bg-[#121211] text-white rounded-xl font-medium transition-all mt-2 flex items-center justify-center ${
          isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-900 hover:shadow-md"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : (
          `Sign in`
        )}
      </motion.button>
    </div>

    <div className="text-center text-sm text-gray-500 mt-6">
      {form.role === "Candidate" ? (
        <>
          New to SkillHire?{' '}
          <a href="/register" className="text-[#121211] font-semibold hover:underline">
            Create account
          </a>
        </>
      ) : (
        <>
          Need an account?{' '}
          <a href="/register" className="text-[#121211] font-semibold hover:underline">
            Register Here
          </a>
        </>
      )}
    </div>
  </form>
</motion.div>
    </div>
    </>
  );
}

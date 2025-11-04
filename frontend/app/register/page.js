'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Candidate',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // password strength checker
  const passwordStrength = useMemo(() => {
    if (form.password.length < 8) return 'Weak';
    if (
      /[A-Z]/.test(form.password) &&
      /[0-9]/.test(form.password) &&
      /[^A-Za-z0-9]/.test(form.password)
    ) {
      return 'Strong';
    }
    return 'Medium';
  }, [form.password]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // map UI role to backend role
  function mapRole(uiRole) {
    if (!uiRole) return 'candidate';
    if (uiRole.toLowerCase() === 'company') return 'recruiter';
    if (uiRole.toLowerCase() === 'candidate') return 'candidate';
    return uiRole.toLowerCase();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const role = mapRole(form.role);

      let payload = {
        email: form.email,
        password: form.password,
        role,
      };

      if (role === 'candidate') {
        payload.firstName = form.firstName;
        payload.middleName = form.middleName || '';
        payload.lastName = form.lastName;
      } else if (role === 'recruiter') {
        payload.companyName = form.companyName;
      }

      await api.post('/auth/register', payload);

      router.push('/login');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // form validation
  const isFormValid = useMemo(() => {
    if (form.role === 'Candidate') {
      return (
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.email.includes('@') &&
        form.password.length >= 8 &&
        form.password === form.confirmPassword
      );
    } else {
      return (
        form.companyName.trim() &&
        form.email.includes('@') &&
        form.password.length >= 8 &&
        form.password === form.confirmPassword
      );
    }
  }, [form]);

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
            <span className="text-xl font-bold tracking-tight">
              SkillHire AI
            </span>
          </motion.div>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center bg-[#FDEBD3] p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-xl border rounded-3xl mx-auto"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Join SkillHire
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
                Create your account to get started
              </p>
            </div>

            {/* Role toggle */}
            <div className="flex justify-between mb-6 bg-gray-50 p-1 rounded-xl">
              {['Candidate', 'Company'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  className={`flex-1 py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                    form.role === role
                      ? 'bg-white text-[#121211] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 text-red-600 text-xs sm:text-sm font-medium bg-red-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {form.role === 'Candidate' ? (
                <>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="middleName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                    >
                      Middle Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      value={form.middleName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  {form.role === 'Candidate' ? 'Student Email' : 'Work Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                />
                <p
                  className={`mt-1 text-xs ${
                    passwordStrength === 'Strong'
                      ? 'text-green-600'
                      : passwordStrength === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  Strength: {passwordStrength}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#121211] outline-none"
                />
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  className="h-4 w-4 text-[#121211] focus:ring-[#121211] border-gray-300 rounded"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-xs sm:text-sm text-gray-700"
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-[#121211] font-medium hover:underline"
                  >
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-[#121211] font-medium hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading || !isFormValid}
                whileHover={!isLoading && isFormValid ? { scale: 1.01 } : {}}
                whileTap={!isLoading && isFormValid ? { scale: 0.99 } : {}}
                className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm bg-[#121211] text-white rounded-xl font-medium flex items-center justify-center ${
                  isLoading || !isFormValid
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-gray-900 hover:shadow-md'
                }`}
              >
                {isLoading
                  ? 'Creating account...'
                  : `Register as ${form.role}`}
              </motion.button>
            </div>

            <div className="text-center text-xs sm:text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#121211] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

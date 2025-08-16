"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from '@/context/AuthProvider';
const SkillHireLanding = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
   const { login } = useAuth(); // From AuthProvider
   
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(form.email, form.password); // calls login from AuthProvider
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfcfb] to-[#f5f5f3] text-[#121211]">
      {/* Header */}
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
          <div className="flex justify-end gap-4">
<nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
            <a href="#features" className="hover:text-[#121211] py-2">
              Features
            </a>
            <a href="#how" className="hover:text-[#121211] py-2">
              How It Works
            </a>
            
            <a href="#contact" className="hover:text-[#121211] py-2">
              Contact
            </a>
            
          </nav>
          <Link href="/login">
            <button className="hidden md:block bg-[#121211] text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="hidden md:block bg-[#FDEBD3] text-[#121211] px-4 py-2 rounded-lg hover:bg-[#F6E3C5] transition">
              Register
            </button>
          </Link>
          </div>
          
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-[#FDEBD3] border-b border-gray-700 flex items-center pt-20 px-6">
        <div className="container mx-auto md:px-16 flex flex-col-reverse lg:flex-row items-center gap-16">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 "
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block">AI-Powered Student</span>
              <span className="block text-[#121211]">Hiring Revolution</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              SkillHire AI replaces outdated resume screening with AI-led,
              skill-based interviews. We give every student a fair chance —
              measured on skills, logic, communication, and confidence.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                "AI-driven assessments",
                "Bias-free hiring",
                "Real skill validation",
                "Instant candidate ranking",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-green-600 text-lg">✓</span>
                  <span className="text-gray-700">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Login Card */}
          {/* Login Card */}
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full  max-w-md"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-[#fffefb] rounded-3xl p-8 mx-auto  border-gray-700 border  hover:shadow-2xl transition-all duration-300"
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
                  className={`w-full py-3.5 bg-[#121211] text-white rounded-xl font-medium transition-all mt-2 flex items-center justify-center ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-900 hover:shadow-md"
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
                    <a href="#" className="text-[#121211] font-semibold hover:underline">
                      Register Here
                    </a>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 ">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose SkillHire AI?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "AI-Powered Interviews",
                desc: "Simulate real job interviews with instant AI-driven scoring.",
              },
              {
                title: "Skill-Centric Evaluation",
                desc: "Assess candidates purely on skill mastery and reasoning ability.",
              },
              {
                title: "Bias-Free Process",
                desc: "Remove bias from hiring and focus on true capability.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-6 bg-[#D7D7FD] rounded-xl shadow hover:shadow-md"
              >
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-gradient-to-b from-[#f5f5f3] to-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-10">
            {[
              "Create job group & skill requirements",
              "Students apply & take AI-led interviews",
              "AI scores skills, logic & communication",
              "Get ranked candidate list instantly",
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
              >
                <div className="w-12 h-12 mx-auto bg-[#121211] text-white flex items-center justify-center rounded-full mb-4 font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-600">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer id="contact" className="bg-[#121211] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to revolutionize hiring?
          </h3>
          <p className="text-gray-300 mb-6">
            Sign up today and experience skill-first recruitment.
          </p>
          <a
            href="#"
            className="px-6 py-3 bg-white text-[#121211] rounded-lg font-medium hover:bg-gray-200"
          >
            Get Started
          </a>
          <p className="mt-8 text-gray-400 text-sm">
            © {new Date().getFullYear()} SkillHire AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SkillHireLanding;

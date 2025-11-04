"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-[#ffffff] backdrop-blur-sm z-50 py-3 px-6 md:px-12  border-b-2 border-zinc-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">SkillHire<span className="text-gray-900">AI</span></span>
          </motion.div>

          <div className="hidden md:flex font-medium space-x-10">
            <a href="#features" className="text-gray-600 hover:border-b-2 hover:text-black transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:border-b-2 hover:text-black transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:border-b-2 hover:text-black transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:border-b-2 hover:text-black transition-colors">Testimonials</a>
          </div>

          <div className="hidden md:flex space-x-4">
            <Link href="/register" className="px-5 py-2 text-gray-600 hover:border rounded-lg hover:text-black transition-colors">Register</Link>
            <Link href="/login" className="px-5 py-2 bg-[#262026] text-white rounded-lg hover:bg-white hover:text-black border transition-colors">Login</Link>
          </div>

          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#e5f4f1] p-4 border-t border-gray-100"
          >
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-black transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</a>
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                <button className="w-full py-2 text-gray-600 hover:text-black transition-colors">Login</button>
                <button className="w-full py-2 bg-[#262026] text-white rounded-lg hover:bg-white hover:text-black border transition-colors">Get Started</button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 bg-[#fbd5d9] border-b-2 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Interviews, <span className="text-purple-700">not keywords</span>. Skills, not fluff.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Revolutionizing student hiring with AI-powered skill validation. Replace resume keyword matching with actual skill demonstration.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#262026] hover:scale-110 text-white font-medium py-3 px-8 rounded-lg transition duration-300 flex items-center">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button className="border-2 border-gray-700 hover:scale-105 text-gray-700 hover:text-gray-600 font-medium py-3 px-8 rounded-lg transition duration-300 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2 relative"
            >
              <div className="bg-[#fee1fe] border-2 rounded-3xl p-8 md:p-12">
                <img 
                  src="images/at-office.svg" 
                  alt="SkillHire AI Platform" 
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div className="absolute -top-6 -right-6 bg-white border-2 rounded-2xl shadow-lg p-4 w-32">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white border rounded-2xl shadow-lg p-4 w-32">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">5x</div>
                  <div className="text-sm text-gray-600">Faster Hiring</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#f9eeec] border-b-2 px-6 md:px-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-[#262026]">95%</h3>
              <p className="text-gray-600">Accuracy in Skill Assessment</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-[#262026]">5x</h3>
              <p className="text-gray-600">Faster Hiring Process</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-[#262026]">100+</h3>
              <p className="text-gray-600">Skills Evaluated</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-[#262026]">80%</h3>
              <p className="text-gray-600">Reduction in Bias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 md:px-12" id="problem">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              The Problem With Traditional Hiring
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional resume screening often misses talented candidates who don't have polished resumes or come from less prestigious institutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#f2c4cf] p-8 rounded-2xl shadow-sm  border border-gray-100   hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Keyword Filtering</h3>
              <p className="text-gray-600">
                Talented candidates get rejected because their resumes don't contain the right keywords, regardless of actual skill level.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#fde3c5] p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Inequality in Opportunity</h3>
              <p className="text-gray-600">
                Students from lesser-known colleges rarely get a chance to prove themselves, regardless of their actual capabilities.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#c9beff] p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Time-Consuming Process</h3>
              <p className="text-gray-600">
                Companies spend countless hours screening resumes and conducting initial interviews with unqualified candidates.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-[#fde3c4] border-2 px-6 md:px-12" id="solution">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-gray-800 mb-6"
              >
                How SkillHire AI Solves These Problems
              </motion.h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform uses advanced AI to evaluate actual skills rather than resume formatting, giving every student an equal opportunity.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-[#ffffff]  rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">AI-Powered Skill Validation</h3>
                    <p className="text-gray-600">Custom interviews based on specific skills with AI evaluation of responses.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-[#ffffff] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Comprehensive Scoring System</h3>
                    <p className="text-gray-600">Evaluate technical skills, logical reasoning, communication, and confidence.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-[#ffffff] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Equal Opportunity Platform</h3>
                    <p className="text-gray-600">Focus on demonstrated skills rather than pedigree for fair evaluation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <div className="flex justify-center items-center rounded-3xl p-2 ">
                <img 
                  src="/images/Artificial-intelligence.svg"
                  alt="Skill Assessment" 
                  className="rounded-2xl max-h-96"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 md:px-12" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              How SkillHire AI Works
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed to be intuitive for both companies and students, making the hiring process efficient and effective.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-700 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-3xl">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Companies Define Requirements</h3>
              <p className="text-gray-600">
                Companies create job groups with specific skill requirements and set weightages for each skill.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-700 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-3xl">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Students Demonstrate Skills</h3>
              <p className="text-gray-600">
                Students apply to positions and complete AI-led interviews that test their actual abilities.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-700 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-3xl">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">AI Evaluation & Ranking</h3>
              <p className="text-gray-600">
                Our AI evaluates responses and ranks candidates based on skill mastery, providing detailed feedback.
              </p>
            </motion.div>
          </div>
          
          <div className="bg-[#d4f8db] border-2 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Detailed Scoring System</h3>
                <p className="text-lg text-gray-600 mb-8">
                  Our comprehensive evaluation covers multiple dimensions to ensure a complete assessment of each candidate.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Technical Skills</span>
                      <span className="text-gray-700">20 pts</span>
                    </div>
                    <div className="w-full bg-white border border-gray-100 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Logical Reasoning</span>
                      <span className="text-gray-700">20 pts</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Communication</span>
                      <span className="text-gray-700">20 pts</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Confidence</span>
                      <span className="text-gray-700">20 pts</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Character Traits</span>
                      <span className="text-gray-700">20 pts</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className=" h-full rounded-2xl p-2  flex justify-center items-center">
                  <img 
                    src="images/Analysis.svg"
                    alt="Scoring Dashboard" 
                    className="rounded-xl   "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#fee1fe] border-2 px-6 md:px-12" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Powerful Features
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SkillHire AI offers a comprehensive set of tools for both companies and students to transform the hiring process.
            </p>
          </div>
          
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl bg-[#fee1fe] border-2 p-1">
              <button 
                className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-[#262026] text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setActiveTab('overview')}
              >
                Platform Overview
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'company' ? 'bg-[#262026] text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setActiveTab('company')}
              >
                Company Features
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'student' ? 'bg-[#262026] text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setActiveTab('student')}
              >
                Student Features
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'ai' ? 'bg-[#262026] text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setActiveTab('ai')}
              >
                AI Engine
              </button>
            </div>
          </div>
          
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">Complete Hiring Solution</h3>
                  <p className="text-lg text-gray-600 mb-8">
                    SkillHire AI provides an end-to-end platform for companies to define job requirements, evaluate candidates, and make data-driven hiring decisions.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Customizable job groups with specific skill requirements</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Structured AI-led interviews tailored to each position</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Comprehensive scoring system with detailed feedback</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className=" rounded-3xl p-2  md:pl-24 ">
                    <img 
                      src="images/resume.svg" 
                      alt="Platform Overview" 
                      className="rounded-2xl max-h-96 "
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'company' && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">For Companies</h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Our company module provides powerful tools to streamline your hiring process and find the best talent based on actual skills.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Create custom job groups with specific skill requirements</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Set weightages for different skills based on importance</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">View ranked applicants with detailed score breakdowns</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Export results to Excel/CSV for further analysis</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="rounded-3xl p-2  md:pl-24 ">
                    <img 
                      src="images/company.svg" 
                      alt="Company Features" 
                      className="rounded-2xl max-h-96"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'student' && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">For Students</h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Students can showcase their actual skills rather than relying on resume formatting, getting valuable feedback regardless of the outcome.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Build a profile showcasing your skills and experience</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Apply to positions and demonstrate skills through AI interviews</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Receive detailed feedback on your performance</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Track skill growth over time with personalized recommendations</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="rounded-3xl p-2  md:pl-24">
                    <img 
                      src="images/students.svg"
                      alt="Student Features" 
                      className="rounded-2xl max-h-96"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'ai' && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">AI Interview Engine</h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Our advanced AI engine creates tailored interviews, evaluates responses, and provides comprehensive scoring across multiple dimensions.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Skill Parser: Reads company requirements and generates tailored questions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Question Generator: Creates role-specific technical and behavioral questions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Multi-Mode Support: Text, audio, and video interview options</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-600">Comprehensive Analysis: Evaluates technical accuracy, logic, communication, and confidence</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="rounded-3xl p-2  md:pl-24">
                    <img 
                      src="images/ai.svg"
                      alt="ai Features" 
                      className="rounded-2xl max-h-96"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Advanced Technology Stack
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SkillHire AI leverages cutting-edge technologies to deliver a seamless and powerful hiring platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-900 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Next.js Frontend</h3>
              <p className="text-gray-600">Modern React framework for fast, responsive user interfaces</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-900 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Node.js Backend</h3>
              <p className="text-gray-600">Scalable server environment with Express.js for API routes</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-900 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">MongoDB Database</h3>
              <p className="text-gray-600">Flexible NoSQL database for storing user and application data</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border-2 p-6 rounded-2xl shadow-sm  border-gray-900 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Integration</h3>
              <p className="text-gray-600">GPT for question generation, Whisper for audio processing</p>
            </motion.div>
          </div>
          
          <div className="bg-green-50 border rounded-3xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">How Our AI Models Work Together</h3>
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="text-center mb-8 md:mb-0">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Resume Parser</h4>
                <p className="text-sm text-gray-600">spaCy + Pyresparser</p>
              </div>
              
              <div className="hidden md:block">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              <div className="text-center mb-8 md:mb-0">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Skill Matcher</h4>
                <p className="text-sm text-gray-600">Jaccard/Cosine Similarity</p>
              </div>
              
              <div className="hidden md:block">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              <div className="text-center mb-8 md:mb-0">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Interview LLM</h4>
                <p className="text-sm text-gray-600">Mistral/LLama2</p>
              </div>
              
              <div className="hidden md:block">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Scoring System</h4>
                <p className="text-sm text-gray-600">Custom logic + T5/DistilBERT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

   

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center bg-gradient-to-r from-[#000000] to-[#2d2d2b] rounded-3xl p-12 md:p-16">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Hiring Process?</h2>
          <p className="text-xl text-blue-100 mb-10">
            Join companies and students who are already benefiting from SkillHire AI's skill-based hiring platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-[#262026] hover:bg-blue-50 font-medium py-4 px-10 rounded-xl transition duration-300 flex items-center justify-center">
              Get Started for Companies
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-4 px-10 rounded-xl transition duration-300">
              Sign Up as Student
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-zinc-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">SkillHire<span className="text-blue-400">AI</span></span>
              </div>
              <p className="mb-6">
                Transforming student hiring with AI-powered skill validation and interviews.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">For Companies</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise Solutions</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">For Students</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Create Profile</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skill Assessment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Practice Interviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contact@skillhireai.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
           
                        <p>&copy; {new Date().getFullYear()} SkillHire AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
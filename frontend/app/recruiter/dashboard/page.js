"use client";
import { useState, useEffect } from "react";
import api from "@/utils/axios"; 
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Check, Copy, Edit2, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function RecruitmentDashboard() {
  const [jobGroups, setJobGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employmentType: "full-time",
    location: "",
    workMode: "onsite",
    seniority: "junior",
    salary: { min: "", max: "", currency: "USD", isNegotiable: true },
    timeline: { applicationDeadline: "", interviewStart: "", finalDecision: "" },
    status: "draft",
    priority: "medium",
    skillsRequired: [{ name: "", weight: 1 }],
    softSkills: [{ name: "", weight: 1 }],
    evaluationCriteria: {
      technical: 0.5,
      softSkills: 0.2,
      communication: 0.15,
      problemSolving: 0.15,
    },
    recruiterPrompt: "",
    tags: [],
    visibility: "public",
  });


  useEffect(() => {
    const fetchJobGroups = async () => {
      try {
        setLoading(true);
        const res = await api.get("/recruitment"); 
        setJobGroups(res.data || []);
      } catch (err) {
        console.error("Error fetching job groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobGroups();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleArrayInputChange = (arrayName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSkill = (arrayName) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { name: "", weight: 1 }],
    }));
  };

  const removeSkill = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/recruitment", formData); 
      setJobGroups((prev) => [res.data, ...prev]); 
      setShowModal(false);

      // Reset form
      setFormData({
        title: "",
        description: "",
        employmentType: "full-time",
        location: "",
        workMode: "onsite",
        seniority: "junior",
        salary: { min: "", max: "", currency: "USD", isNegotiable: true },
        timeline: { applicationDeadline: "", interviewStart: "", finalDecision: "" },
        status: "draft",
        priority: "medium",
        skillsRequired: [{ name: "", weight: 1 }],
        softSkills: [{ name: "", weight: 1 }],
        evaluationCriteria: {
          technical: 0.5,
          softSkills: 0.2,
          communication: 0.15,
          problemSolving: 0.15,
        },
        recruiterPrompt: "",
        tags: [],
        visibility: "public",
      });
      setActiveTab(0);
    } catch (err) {
      console.error("Error creating job group:", err.response?.data || err.message);
    }
  };

 
  const handleDelete = async (id) => {
    try {
      await api.delete(`/recruitment/${id}`);
      setJobGroups((prev) => prev.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Error deleting job group:", err.response?.data || err.message);
    }
  };

  const tabs = [
    "Job Details",
    "Skills & Evaluation",
    "Compensation",
    "Timeline",
    "Additional Info",
  ];

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Recruitment Dashboard</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#262026] text-white px-4 py-3 rounded-lg hover:border hover:text-zinc-900 hover:bg-white transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add Recruitment
          </button>
        </div>

        {/* Job Groups Grid */}
        {jobGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobGroups.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#f9eeec] rounded-xl  border-2 border-gray-900 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#262026]">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' ? 'bg-green-100 text-green-800' :
                      job.status === 'closed' ? 'bg-red-100 text-red-800' :
                      job.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-900 mb-2">
                    <Briefcase size={16} className="mr-2" />
                    {job.employmentType}
                  </div>
                  
                  <div className="text-sm text-gray-800 mb-4">{job.location}</div>
                  
                  {/* Join Code Section */}
                  <div className="mb-4 p-3 bg-orange-50 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-purple-700 font-medium">Join Code</p>
                        <p className="text-blue-900 font-mono">{job.joinCode}</p>
                      </div>
                      <button
                        onClick={() => copyJoinCode(job.joinCode)}
                        className="p-2 text-purple-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Copy join code"
                      >
                        {copiedCode === job.joinCode ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-purple-800 mt-1">Share this code with other recruiters</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900">
                      {job.applicationsCount || 0} applications
                    </span>
                    
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No recruitments yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first job recruitment</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#262026] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Create Recruitment
            </button>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed  inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-opacity-50"
              onClick={() => setShowModal(false)}
            />
            
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Job Recruitment</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto px-6">
                    {tabs.map((tab, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === index
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
                  {/* Tab 1: Job Details */}
                  {activeTab === 0 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="e.g. Senior Frontend Developer"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Describe the role, responsibilities, and requirements..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                          <select
                            name="employmentType"
                            value={formData.employmentType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="internship">Internship</option>
                            <option value="contract">Contract</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                          <select
                            name="workMode"
                            value={formData.workMode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="onsite">On-site</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                          <select
                            name="seniority"
                            value={formData.seniority}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="intern">Intern</option>
                            <option value="junior">Junior</option>
                            <option value="mid">Mid-level</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g. New York, NY or Remote"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Skills & Evaluation */}
                  {activeTab === 1 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Technical Skills Required</label>
                          <button
                            type="button"
                            onClick={() => addSkill('skillsRequired')}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            + Add Skill
                          </button>
                        </div>
                        {formData.skillsRequired.map((skill, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => handleArrayInputChange('skillsRequired', index, 'name', e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Skill name"
                            />
                            <select
                              value={skill.weight}
                              onChange={(e) => handleArrayInputChange('skillsRequired', index, 'weight', parseInt(e.target.value))}
                              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value={1}>Low</option>
                              <option value={2}>Medium</option>
                              <option value={3}>High</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeSkill('skillsRequired', index)}
                              className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Soft Skills</label>
                          <button
                            type="button"
                            onClick={() => addSkill('softSkills')}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            + Add Skill
                          </button>
                        </div>
                        {formData.softSkills.map((skill, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => handleArrayInputChange('softSkills', index, 'name', e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Soft skill name"
                            />
                            <select
                              value={skill.weight}
                              onChange={(e) => handleArrayInputChange('softSkills', index, 'weight', parseInt(e.target.value))}
                              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value={1}>Low</option>
                              <option value={2}>Medium</option>
                              <option value={3}>High</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeSkill('softSkills', index)}
                              className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Criteria Weights</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Technical Skills</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={formData.evaluationCriteria.technical}
                              onChange={(e) => handleNestedInputChange('evaluationCriteria', 'technical', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{Math.round(formData.evaluationCriteria.technical * 100)}%</span>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Soft Skills</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={formData.evaluationCriteria.softSkills}
                              onChange={(e) => handleNestedInputChange('evaluationCriteria', 'softSkills', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{Math.round(formData.evaluationCriteria.softSkills * 100)}%</span>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Communication</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={formData.evaluationCriteria.communication}
                              onChange={(e) => handleNestedInputChange('evaluationCriteria', 'communication', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{Math.round(formData.evaluationCriteria.communication * 100)}%</span>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Problem Solving</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={formData.evaluationCriteria.problemSolving}
                              onChange={(e) => handleNestedInputChange('evaluationCriteria', 'problemSolving', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{Math.round(formData.evaluationCriteria.problemSolving * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Compensation */}
                  {activeTab === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              {formData.salary.currency}
                            </span>
                            <input
                              type="number"
                              value={formData.salary.min}
                              onChange={(e) => handleNestedInputChange('salary', 'min', e.target.value)}
                              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              {formData.salary.currency}
                            </span>
                            <input
                              type="number"
                              value={formData.salary.max}
                              onChange={(e) => handleNestedInputChange('salary', 'max', e.target.value)}
                              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isNegotiable"
                          checked={formData.salary.isNegotiable}
                          onChange={(e) => handleNestedInputChange('salary', 'isNegotiable', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                        />
                        <label htmlFor="isNegotiable" className="ml-2 block text-sm text-gray-900">
                          Salary is negotiable
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={formData.salary.currency}
                          onChange={(e) => handleNestedInputChange('salary', 'currency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Timeline */}
                  {activeTab === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                        <input
                          type="date"
                          value={formData.timeline.applicationDeadline}
                          onChange={(e) => handleNestedInputChange('timeline', 'applicationDeadline', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interview Start Date (Estimated)</label>
                        <input
                          type="date"
                          value={formData.timeline.interviewStart}
                          onChange={(e) => handleNestedInputChange('timeline', 'interviewStart', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Final Decision Date (Estimated)</label>
                        <input
                          type="date"
                          value={formData.timeline.finalDecision}
                          onChange={(e) => handleNestedInputChange('timeline', 'finalDecision', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="draft">Draft</option>
                            <option value="open">Open</option>
                            <option value="on-hold">On Hold</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Additional Info */}
                  {activeTab === 4 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter Prompt</label>
                        <textarea
                          name="recruiterPrompt"
                          value={formData.recruiterPrompt}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Any specific instructions or notes for recruiters..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <input
                          type="text"
                          value={formData.tags.join(', ')}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter tags separated by commas (e.g. tech, engineering, remote)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                        <select
                          name="visibility"
                          value={formData.visibility}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="internal">Internal</option>
                        </select>
                      </div>
                    </div>
                  )}
                </form>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    {activeTab > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(activeTab - 1)}
                        className="flex items-center gap-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {activeTab < tabs.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(activeTab + 1)}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create Job
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { FiHome, FiClipboard, FiPlus, FiX } from "react-icons/fi";
import api from "@/utils/axios";

export default function RecruiterDashboard() {
  const [jobGroups, setJobGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    skillsRequired: [{ skillName: "", weightage: "" }],
    miniProject: ""
  });

  // Fetch all job groups on mount
  useEffect(() => {
    fetchJobGroups();
  }, []);

  async function fetchJobGroups() {
    try {
      setLoading(true);
      const { data } = await api.get("/jobgroups");
      setJobGroups(data);
      console.log("Fetched job groups:", data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recruitments");
    } finally {
      setLoading(false);
    }
  }

  async function createRecruitment() {
    try {
      const { data } = await api.post("/jobgroups", form);
      setCreatedCode(data.joinCode);
      fetchJobGroups();
      setForm({
        title: "",
        description: "",
        deadline: "",
        skillsRequired: [{ skillName: "", weightage: "" }],
        miniProject: ""
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create recruitment");
    }
  }

  function addSkill() {
    setForm({
      ...form,
      skillsRequired: [...form.skillsRequired, { skillName: "", weightage: "" }]
    });
  }

  function handleSkillChange(idx, key, value) {
    const updatedSkills = [...form.skillsRequired];
    updatedSkills[idx][key] = value;
    setForm({ ...form, skillsRequired: updatedSkills });
  }

  function removeSkill(index) {
    const updatedSkills = form.skillsRequired.filter((_, i) => i !== index);
    setForm({ ...form, skillsRequired: updatedSkills });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <FiHome className="text-blue-500" /> Recruiter Dashboard
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FiPlus /> Create Recruitment
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* Recruitments List */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
          <FiClipboard className="text-blue-500" /> Your Recruitments
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : jobGroups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <FiClipboard className="mx-auto text-3xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No recruitments found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first recruitment</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Create Recruitment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobGroups.jobGroups.map(job => (
              <div key={job._id} className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <span className="font-medium mr-2">Deadline:</span>
                      {new Date(job.deadline).toLocaleDateString()}
                    </div>
                    <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      Join Code: {job.joinCode}
                    </div>
                  </div>

                  {job.skillsRequired?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.map((s, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                            {s.skillName} ({s.weightage}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.miniProject && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Mini Project</h4>
                      <p className="text-sm text-gray-600">{job.miniProject}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Recruitment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 pt-10">
          <div className="bg-white rounded-lg border border-gray-300 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b border-gray-200 p-5">
              <h2 className="text-xl font-bold text-gray-800">Create Recruitment</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCreatedCode("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  placeholder="e.g. Senior Frontend Developer"
                  className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  placeholder="Describe the role and expectations..."
                  rows={3}
                  className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                <input
                  type="date"
                  className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <div className="space-y-2">
                  {form.skillsRequired.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder="Skill name"
                        className="border border-gray-300 p-2 flex-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        value={s.skillName}
                        onChange={e => handleSkillChange(idx, "skillName", e.target.value)}
                      />
                      <input
                        placeholder="%"
                        type="number"
                        min="1"
                        max="100"
                        className="border border-gray-300 p-2 w-16 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        value={s.weightage}
                        onChange={e => handleSkillChange(idx, "weightage", e.target.value)}
                      />
                      {form.skillsRequired.length > 1 && (
                        <button
                          onClick={() => removeSkill(idx)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addSkill}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <FiPlus size={14} /> Add another skill
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mini Project (Optional)</label>
                <input
                  placeholder="e.g. Build a todo app with React"
                  className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  value={form.miniProject}
                  onChange={e => setForm({ ...form, miniProject: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCreatedCode("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createRecruitment}
                disabled={!form.title || !form.description || !form.deadline}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg disabled:cursor-not-allowed"
              >
                Create Recruitment
              </button>
            </div>

            {createdCode && (
              <div className="border-t border-gray-200 p-5 bg-blue-50">
                <h3 className="font-medium text-blue-700 mb-2">Recruitment created successfully!</h3>
                <p className="text-sm text-blue-600 mb-3">Share this code with candidates:</p>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <code className="font-mono font-bold text-blue-600">{createdCode}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
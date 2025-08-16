"use client";

import { useEffect, useState } from "react";
import { FiClock, FiUsers, FiX, FiEdit, FiPlus, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";
import api from "@/utils/axios";

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [editingApp, setEditingApp] = useState(null);
  const [editData, setEditData] = useState({ 
    resume: "", 
    formResponses: {}, 
    miniProjectLink: "" 
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications/my-applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleJoinRequest = async () => {
    if (!joinCode.trim()) return;
    try {
      await api.post(`/applications/apply/${joinCode.trim()}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join recruitment");
    } finally {
      setIsJoinModalOpen(false);
      setJoinCode("");
    }
  };

  const handleWithdraw = async (id) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await api.delete(`/applications/withdraw/${id}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to withdraw");
    }
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setEditData({
      resume: app.resume || "",
      formResponses: app.formResponses || {},
      miniProjectLink: app.miniProjectLink || "",
    });
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/applications/edit/${editingApp._id}`, editData);
      fetchApplications();
      setEditingApp(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to edit application");
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    enrolled: "bg-green-100 text-green-800",
    shortlisted: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <FiPlus size={16} /> New Application
          </motion.button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <FiCalendar className="mx-auto text-3xl text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              No applications yet
            </h3>
            <p className="text-gray-500 mb-4">
              Apply to positions to track your applications here
            </p>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              Start New Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.jobGroup?.title || "Untitled Position"}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {app.jobGroup?.company || "Unknown Company"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[app.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-gray-700 text-sm">
                    <FiClock className="mr-2 text-gray-500" />
                    <span>
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {app.jobGroup?.deadline && (
                    <div className="flex items-center text-gray-700 text-sm">
                      <FiCalendar className="mr-2 text-gray-500" />
                      <span>
                        Deadline: {new Date(app.jobGroup.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Pending Actions */}
                  {app.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(app)}
                        className="flex-1 bg-gray-100 text-gray-900 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        <FiEdit className="inline mr-1" /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWithdraw(app._id)}
                        className="flex-1 bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        <FiX className="inline mr-1" /> Withdraw
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Join Recruitment Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Application</h3>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter application code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={handleJoinRequest}
                className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Application</h3>
              <button
                onClick={() => setEditingApp(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume URL
                </label>
                <input
                  type="text"
                  value={editData.resume}
                  onChange={(e) => setEditData({ ...editData, resume: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <input
                  type="text"
                  value={editData.miniProjectLink}
                  onChange={(e) => setEditData({ ...editData, miniProjectLink: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Responses (JSON)
                </label>
                <textarea
                  value={JSON.stringify(editData.formResponses, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditData({ ...editData, formResponses: JSON.parse(e.target.value || "{}") });
                    } catch (err) {
                      console.error("Invalid JSON");
                    }
                  }}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingApp(null)}
                  className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
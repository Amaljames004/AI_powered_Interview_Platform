"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiPlus,
  FiX,
  FiAlertCircle,
  FiTrendingUp,
  FiAward,
  FiBriefcase,
} from "react-icons/fi";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";

export default function CandidateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [enrolledRecruitments, setEnrolledRecruitments] = useState([]);
  const [skills, setSkills] = useState([]);

  const handleRecruitmentClick = (id) => {
    router.push(`/candidate/dashboard/job-group/${id}`);
  };

  // Fetch dashboard data
  useEffect(() => {
    if (!authLoading && user) {
      const fetchDashboard = async () => {
        try {
          setLoading(true);
          setError("");

          const [interviewsRes, applicationsRes, skillsRes] = await Promise.all([
            api.get("/interviews/upcoming"),
            api.get("/applications/my-applications"),
            api.get("/candidate/skills"),
          ]);

          setUpcomingInterviews(interviewsRes.data || []);
          setEnrolledRecruitments(applicationsRes.data || []);
          setSkills(skillsRes.data.skills || []);
        } catch (err) {
          console.error(err);
          setError("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      };

      fetchDashboard();
    }
  }, [authLoading, user]);

  const handleJoinRequest = async () => {
    if (!joinCode.trim()) return;

    try {
      await api.post(`/applications/apply/${joinCode.trim()}`);

      const updatedEnrollments = await api.get("/applications/my-applications");
      setEnrolledRecruitments(updatedEnrollments.data || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join recruitment");
    } finally {
      setIsJoinModalOpen(false);
      setJoinCode("");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Scheduled Interviews */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiCalendar className="text-gray-900 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Scheduled Interviews
              </h2>
            </div>

            {upcomingInterviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingInterviews.map((interview) => (
                  <motion.div
                    key={interview._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.role}
                        </h3>
                        <div className="flex items-center mt-1">
                          {interview.companyLogo && (
                            <img
                              src={interview.companyLogo}
                              alt={interview.company}
                              className="w-5 h-5 rounded-full mr-2"
                            />
                          )}
                          <p className="text-gray-700 text-sm">
                            {interview.company}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium">
                        Upcoming
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center text-gray-700">
                        <FiClock className="mr-2 text-gray-500" />
                        <span className="text-sm">
                          {new Date(interview.date).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full mt-2 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200"
              >
                <FiAlertCircle className="mx-auto text-3xl text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No interviews scheduled
                </h3>
                <p className="text-gray-500">
                  You'll see your upcoming interviews here
                </p>
              </motion.div>
            )}
          </div>

          {/* Enrolled Recruitments */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiBriefcase className="text-gray-900 text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  My Applications ({enrolledRecruitments.length})
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsJoinModalOpen(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                <FiPlus size={16} /> Apply to New
              </motion.button>
            </div>

            {enrolledRecruitments.length > 0 ? (
              <div className="space-y-4">
                {enrolledRecruitments.map((rec) => (
                  <motion.div
                    key={rec._id}
                    onClick={() => handleRecruitmentClick(rec.jobGroup?._id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className={`p-5 rounded-lg border cursor-pointer ${
                      rec.status === "enrolled"
                        ? "border-blue-200 bg-blue-50"
                        : rec.status === "shortlisted"
                        ? "border-green-200 bg-green-50"
                        : rec.status === "rejected"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {rec.jobGroup?.companyLogo && (
                        <img
                          src={rec.jobGroup.companyLogo}
                          alt={rec.jobGroup.company}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {rec.jobGroup?.title || "Untitled Position"}
                            </h3>
                            <p className="text-gray-700 text-sm">
                              {rec.jobGroup?.company || "Unknown Company"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.status === "enrolled"
                                ? "bg-blue-100 text-blue-800"
                                : rec.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : rec.status === "shortlisted"
                                ? "bg-green-100 text-green-800"
                                : rec.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rec.status?.charAt(0).toUpperCase() +
                              rec.status?.slice(1)}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-gray-400" />
                            <span>
                              {rec.createdAt
                                ? new Date(rec.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          {rec.jobGroup?.deadline && (
                            <div className="flex items-center">
                              <FiClock className="mr-2 text-gray-400" />
                              <span>
                                Due{" "}
                                {new Date(rec.jobGroup.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200"
              >
                <FiBriefcase className="mx-auto text-3xl text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No applications yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Apply to positions to see them here
                </p>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Apply to New Position
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiTrendingUp className="text-gray-900 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm"
                  >
                    {skill}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiAward className="text-gray-900 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Applications</span>
                <span className="font-medium text-gray-900">
                  {enrolledRecruitments.length}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Interviews</span>
                <span className="font-medium text-gray-900">
                  {upcomingInterviews.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Skills</span>
                <span className="font-medium text-gray-900">{skills.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
            onClick={() => setIsJoinModalOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Apply to Position
                </h3>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
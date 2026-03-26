"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiX,
  FiEdit,
  FiCalendar,
  FiExternalLink,
} from "react-icons/fi";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthProvider";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  enrolled: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [editingApp, setEditingApp] = useState(null); // edit or view modal

  // Fetch applications
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/applications/my-applications");
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      }
    };
    fetchApps();
  }, []);

  // Withdraw application
  const handleWithdraw = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw this application?"))
      return;
    try {
      await api.delete(`/applications/withdraw/${id}`);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      console.error("Withdraw failed:", err);
    }
  };

  // Save edited application
  const handleSaveEdit = async () => {
    try {
      await api.put(`/applications/edit/${editingApp._id}`, {
        resume: editingApp.resume,
        projectLink: editingApp.projectLink,
        formResponses: editingApp.formResponses,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === editingApp._id ? { ...app, ...editingApp } : app
        )
      );
      setEditingApp(null);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      {/* Application Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {applications.map((app) => (
          <motion.div
            key={app._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {app.jobGroup?.title || "Untitled Position"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {app.jobGroup?.company?.logo && (
                    <img
                      src={app.jobGroup.company.logo}
                      alt={app.jobGroup.company.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-gray-800 text-sm font-medium">
                      {app.jobGroup?.company?.name || "Unknown Company"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {app.jobGroup?.company?.industry} •{" "}
                      {app.jobGroup?.company?.location}
                    </p>
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[app.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
              </span>
            </div>

            {/* Body */}
            <div className="space-y-3 mt-4 text-sm text-gray-700">
              <p className="line-clamp-2">
                {app.jobGroup?.description || "No description provided"}
              </p>

              <div className="flex items-center text-gray-600">
                <FiClock className="mr-2 text-gray-500" />
                Applied: {new Date(app.createdAt).toLocaleDateString()}
              </div>

              {app.jobGroup?.timeline?.applicationDeadline && (
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2 text-gray-500" />
                  Deadline:{" "}
                  {new Date(
                    app.jobGroup.timeline.applicationDeadline
                  ).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 pt-4 mt-auto">
              {/* Withdraw */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleWithdraw(app._id)}
                className="flex-1 bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
              >
                <FiX className="inline mr-1" /> Withdraw
              </motion.button>

              {/* Edit (only pending) */}
              {app.status === "pending" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingApp({ ...app, viewOnly: false })}
                  className="flex-1 bg-gray-100 text-gray-900 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  <FiEdit className="inline mr-1" /> Edit
                </motion.button>
              )}

              {/* View */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditingApp({ ...app, viewOnly: true })}
                className="flex-1 bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
              >
                View
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/View Modal */}
      <AnimatePresence>
        {editingApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            >
              <h2 className="text-lg font-semibold mb-4">
                {editingApp.viewOnly ? "Application Details" : "Edit Application"}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Resume</label>
                  {editingApp.viewOnly ? (
                    <p className="text-gray-700">{editingApp.resume}</p>
                  ) : (
                    <input
                      type="text"
                      value={editingApp.resume || ""}
                      onChange={(e) =>
                        setEditingApp({ ...editingApp, resume: e.target.value })
                      }
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Project Link</label>
                  {editingApp.viewOnly ? (
                    <a
                      href={editingApp.projectLink}
                      target="_blank"
                      className="text-blue-600 flex items-center gap-1"
                    >
                      {editingApp.projectLink} <FiExternalLink size={14} />
                    </a>
                  ) : (
                    <input
                      type="text"
                      value={editingApp.projectLink || ""}
                      onChange={(e) =>
                        setEditingApp({
                          ...editingApp,
                          projectLink: e.target.value,
                        })
                      }
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Form Responses
                  </label>
                  {editingApp.viewOnly ? (
                    <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
                      {JSON.stringify(editingApp.formResponses, null, 2)}
                    </pre>
                  ) : (
                    <textarea
                      value={
                        JSON.stringify(editingApp.formResponses, null, 2) || ""
                      }
                      onChange={(e) =>
                        setEditingApp({
                          ...editingApp,
                          formResponses: JSON.parse(e.target.value || "{}"),
                        })
                      }
                      rows={4}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingApp(null)}
                  className="px-3 py-1 bg-gray-100 rounded text-sm"
                >
                  Close
                </button>
                {!editingApp.viewOnly && (
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Save
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

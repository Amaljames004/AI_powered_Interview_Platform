"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

function ProgressTracker() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          Invitation Progress
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>Progress tracking will appear here</p>
        <p className="text-sm">
          When you upload candidates, progress will be shown
        </p>
      </div>
    </div>
  );
}

export default function JobGroupDashboardPage() {
  const { jobGroupId } = useParams();
  const router = useRouter();
  const [showProgress, setShowProgress] = useState(false);

  if (!jobGroupId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Job Group Selected
          </h2>
          <p className="text-gray-600">
            Please select a recruitment group to view its dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleUploadClick = () => {
    router.push(`/recruiter/candidate-pool/jobgroup/${jobGroupId}/upload`);
  };

  const handleViewCandidates = () => {
    router.push(`/recruiter/applications/${jobGroupId}`);
  };

  const handleEditGroup = () => {
    router.push(`/recruiter/candidate-pool/jobgroup/${jobGroupId}/edit`);
  };

  const handleScheduleInterview = () => {
    router.push(`/recruiter/candidate-pool/jobgroup/${jobGroupId}/schedule-interview`);
  };

  const handleCandidateManager = () => {
    router.push(`/recruiter/candidate-pool/jobgroup/${jobGroupId}/candidate-manager`);
  };

  const handleDemoProgress = () => {
    setShowProgress(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recruitment Group Dashboard
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                  <span className="text-sm text-gray-500">Group ID:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 font-mono">
                    {jobGroupId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleEditGroup}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                📥 Upload Candidates
              </button>
              <button
                onClick={handleCandidateManager}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                👥 Candidate Manager
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button
              onClick={handleUploadClick}
              className="p-4 text-left border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="text-2xl mb-2">📥</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                Upload Candidates
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Add new candidates via CSV or manual entry
              </p>
            </button>

            <button
              onClick={handleViewCandidates}
              className="p-4 text-left border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
            >
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-green-600">
                View Candidates
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Manage existing candidates and track progress
              </p>
            </button>

            <button
              onClick={handleScheduleInterview}
              className="p-4 text-left border-2 border-dashed border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
            >
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-yellow-600">
                Schedule Interview
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Upload interview schedule CSV for this group
              </p>
            </button>

            <button
              onClick={handleEditGroup}
              className="p-4 text-left border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">
                Group Settings
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Configure recruitment group details and preferences
              </p>
            </button>

            <button
              onClick={handleCandidateManager}
              className="p-4 text-left border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all group"
            >
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-teal-600">
                Candidate Manager
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Manage and shortlist candidates efficiently
              </p>
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Begin by uploading candidates or scheduling interviews for your
              recruitment group. You’ll be able to track progress from here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
              >
                📥 Upload Candidates
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-medium"
              >
                📅 Schedule Interview
              </button>
              <button
                onClick={handleCandidateManager}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-medium"
              >
                👥 Candidate Manager
              </button>
              <button
                onClick={handleDemoProgress}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                👀 See Progress Demo
              </button>
            </div>
          </div>
        </div>

        {showProgress && <ProgressTracker />}
      </div>
    </div>
  );
}

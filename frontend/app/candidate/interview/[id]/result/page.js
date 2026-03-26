"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios";

export default function InterviewResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        if (res.data.status !== "completed") {
          router.replace("/candidate/dashboard");
          return;
        }
        setInterview(res.data);
      } catch (err) {
        console.error("Failed to fetch interview result:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Results Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The interview results could not be loaded.
          </p>
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overall = interview.overallScore || {};
  const weightedTotal = interview.weightedTotal || 0;
  const questions = interview.questions || [];

  const scoreCategories = [
    { key: "technical", label: "Technical", color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { key: "communication", label: "Communication", color: "from-green-500 to-green-600", bg: "bg-green-50" },
    { key: "confidence", label: "Confidence", color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
    { key: "logic", label: "Logic", color: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
    { key: "traits", label: "Traits", color: "from-pink-500 to-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto pb-16">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center border border-gray-200">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Completed!
          </h1>
          <p className="text-gray-600">
            Here's your detailed performance breakdown
          </p>
        </div>

        {/* Weighted Total */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Overall Score
          </h2>
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(weightedTotal / 10) * 263.9} 263.9`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {(weightedTotal * 10).toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-gray-500 mt-4 text-sm">
              Weighted average across all categories
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Score Breakdown
          </h2>
          <div className="space-y-5">
            {scoreCategories.map(({ key, label, color, bg }) => {
              const score = overall[key] || 0;
              const percentage = (score / 10) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {label}
                    </span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${bg} text-gray-800`}>
                      {score.toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-Question AI Evaluation */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Question-by-Question Review
          </h2>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q._id || idx}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{q.question}</p>
                </div>

                {q.answer && q.answer !== "No answer provided" && (
                  <div className="ml-11 mb-3">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Your Answer:
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {q.answer}
                    </p>
                  </div>
                )}

                {q.aiEvaluation && (
                  <div className="ml-11">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      AI Evaluation:
                    </p>
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">{q.aiEvaluation}</p>
                    </div>
                  </div>
                )}

                {q.score && (
                  <div className="ml-11 mt-3 flex flex-wrap gap-2">
                    {scoreCategories.map(({ key, label }) =>
                      q.score[key] !== undefined ? (
                        <span
                          key={key}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {label}: {q.score[key]}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Go to Dashboard */}
        <div className="text-center pb-8">
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

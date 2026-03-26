"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";

export default function CandidateHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/interview/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Fetch history error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No interviews found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Interview History</h2>
      
      <div className="space-y-4">
        {history.map((i) => (
          <div
            key={i._id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{i.role}</h2>
              <p className="text-gray-600">{i.company}</p>
              <p className="text-gray-500 text-sm">
                {new Date(i.date).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm inline-block ${
                  i.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : i.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {i.status}
              </span>
              {i.status === "completed" && (
                <button onClick={() => router.push(`/candidate/interview/${i._id}/result`)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                  View Result
                </button>
              )}
              {i.status === "scheduled" && (
                <button onClick={() => router.push(`/candidate/interview/${i._id}`)} className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded transition-colors">
                   Start Interview
                </button>
              )}
              {i.status === "in-progress" && (
                <button onClick={() => router.push(`/candidate/interview/${i._id}/start`)} className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors">
                   Resume
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

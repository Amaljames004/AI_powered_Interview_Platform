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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Interview History</h1>

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
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  i.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : i.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {i.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/axios";
import BackButton from "@/components/BackButton";

export default function ScheduleInterviewPage() {
  const { jobGroupId } = useParams();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // ⏰ Preview times (first and last slot)
  const previewRange = useMemo(() => {
    if (!date || totalCandidates === 0) return "";
    
    const workStartHour = 9;
    const workEndHour = 17;
    const d = new Date(date);
    d.setHours(workStartHour, 0, 0, 0);
    const startTime = new Date(d);

    // interval between candidates
    const intervalMinutes = Math.floor((workEndHour - workStartHour) * 60 / totalCandidates);
    const lastTime = new Date(startTime.getTime() + (intervalMinutes * (totalCandidates - 1) + duration) * 60 * 1000);

    return `${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → ${lastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }, [date, duration, totalCandidates]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return alert("Please select a CSV file");
    if (!date) return alert("Please select an interview date");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobGroupId", jobGroupId);
    formData.append("date", date); // send as YYYY-MM-DD
    formData.append("duration", duration.toString());

    setStatus("📥 Uploading and scheduling interviews...");

    try {
      const res = await api.post("/interview/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const success = res.data.success || 0;
      const total = res.data.total || 0;
      setTotalCandidates(total); // update candidate count for preview
      setStatus(`✅ ${success}/${total} interviews scheduled successfully`);
    } catch (err) {
      console.error("❌ Upload error:", err);
      if (err.response?.data?.message)
        setStatus(`❌ ${err.response.data.message}`);
      else setStatus("❌ Failed to upload or schedule interviews");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <BackButton href={`/recruiter/candidate-pool/jobgroup/${jobGroupId}`} />
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          📅 Schedule AI Interviews
        </h1>
        <p className="text-gray-600 mb-4">
          Upload a CSV file with candidate <strong>emails</strong>, then select
          a date for the AI interviews.
        </p>

        <form onSubmit={handleUpload}>
          {/* CSV Upload */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border p-2 w-full rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              CSV must contain a column: <strong>email</strong>
            </p>
          </div>

          {/* Interview Date */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">
              Interview Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">
              Duration (minutes per candidate)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Preview */}
          {date && totalCandidates > 0 && (
            <div className="bg-gray-100 p-3 rounded-lg mb-6 text-gray-700">
              <p>🕘 <strong>Interview Time Range:</strong> {previewRange}</p>
              <p className="text-sm text-gray-500 mt-1">
                Candidates will be evenly distributed within working hours (9 AM - 5 PM).
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold"
          >
            🚀 Schedule Interviews
          </button>
        </form>

        {status && (
          <div className="mt-6 text-center text-gray-700 font-medium whitespace-pre-line">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

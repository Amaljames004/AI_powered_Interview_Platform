"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/axios";
import BackButton from "@/components/BackButton";

export default function UploadCandidates() {
  const { jobGroupId } = useParams();

  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [emailColumn, setEmailColumn] = useState("");
  const [emails, setEmails] = useState([""]);
  const [previewEmails, setPreviewEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("csv"); // 'csv' or 'manual'

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    setFile(f);

    if (f) {
      const text = await f.text();
      const lines = text.split("\n").map((line) => line.split(","));
      const cols = lines[0].map((c) => c.trim());

      setHeaders(cols);
      setEmailColumn(cols[0]);

      const preview = lines
        .slice(1, 5)
        .map((row) => row[0]?.trim())
        .filter((v) => v);
      setPreviewEmails(preview);
    }
  };

  const handleColumnChange = (col) => {
    setEmailColumn(col);

    if (file) {
      file.text().then((text) => {
        const lines = text.split("\n").map((line) => line.split(","));
        const colIndex = headers.indexOf(col);

        const preview = lines
          .slice(1, 5)
          .map((row) => row[colIndex]?.trim())
          .filter((v) => v);
        setPreviewEmails(preview);
      });
    }
  };

  const addEmailField = () => setEmails([...emails, ""]);
  
  const updateEmail = (i, val) => {
    const updated = [...emails];
    updated[i] = val;
    setEmails(updated);
  };

  const removeEmailField = (index) => {
    const updated = emails.filter((_, i) => i !== index);
    setEmails(updated.length ? updated : [""]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if ((!file || !emailColumn) && emails.every((e) => !e.trim())) {
      return alert("Please select a CSV with emails or add at least one email manually");
    }

    const formData = new FormData();
    if (file && emailColumn) {
      formData.append("file", file);
      formData.append("emailColumn", emailColumn);
    }
    formData.append("jobGroupId", jobGroupId);

    const manualEmails = emails.filter((e) => e.trim() !== "");
    if (manualEmails.length > 0) {
      formData.append("manualEmails", JSON.stringify(manualEmails));
    }

    try {
      setLoading(true);
      const { data } = await api.post("/invites/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setHeaders([]);
    setEmailColumn("");
    setEmails([""]);
    setPreviewEmails([]);
    setResult(null);
  };

  const totalEmails = emails.filter(e => e.trim()).length + previewEmails.length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BackButton href={`/recruiter/candidate-pool/jobgroup/${jobGroupId}`} />
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invite Candidates
          </h1>
          <p className="text-gray-600">
            Add candidates to your recruitment group via CSV upload or manual entry
          </p>
          <div className="inline-flex items-center px-4 py-2 mt-4 bg-white rounded-full border border-gray-200">
            <span className="text-sm text-gray-500">Group ID:</span>
            <span className="ml-2 text-sm font-medium text-gray-900">{jobGroupId}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                activeTab === "csv"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📁 CSV Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                activeTab === "manual"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ✏️ Manual Entry
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* CSV Upload Section */}
            {activeTab === "csv" && (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center transition-colors hover:border-blue-400">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📁</span>
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {file ? file.name : "Choose CSV File"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Drag & drop or click to upload your candidate list
                    </p>
                    {!file && (
                      <p className="text-gray-400 text-xs mt-2">
                        Supports .csv files with email columns
                      </p>
                    )}
                  </label>
                </div>

                {/* Column Selector */}
                {headers.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Email Column
                    </label>
                    <select
                      value={emailColumn}
                      onChange={(e) => handleColumnChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      {headers.map((h, i) => (
                        <option key={i} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>

                    {/* Preview */}
                    {previewEmails.length > 0 && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-700 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Preview (first {previewEmails.length} emails)
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {previewEmails.map((email, i) => (
                            <div key={i} className="text-sm text-gray-600 py-1 px-2 bg-gray-50 rounded">
                              {email}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry Section */}
            {activeTab === "manual" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700 flex items-center">
                    <span className="mr-2">💡</span>
                    Add candidate emails one by one. Invitations will be sent immediately.
                  </p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {emails.map((email, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="email"
                          placeholder="candidate@example.com"
                          value={email}
                          onChange={(e) => updateEmail(i, e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                      {emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(i)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addEmailField}
                  className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  + Add Another Email
                </button>
              </div>
            )}

            {/* Summary & Action */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Ready to send invitations
                  </p>
                  <p className="text-sm text-gray-600">
                    {totalEmails > 0 
                      ? `Will send ${totalEmails} invitation${totalEmails > 1 ? 's' : ''}`
                      : 'Add candidates to get started'
                    }
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading || totalEmails === 0}
                    className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${
                      loading || totalEmails === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        🚀 Send Invitations
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Results */}
          {result && (
            <div className={`mt-6 rounded-2xl p-6 border-2 ${
              result.error 
                ? "bg-red-50 border-red-200" 
                : "bg-green-50 border-green-200"
            }`}>
              {result.error ? (
                <div className="flex items-center gap-3 text-red-700">
                  <span className="text-xl">❌</span>
                  <div>
                    <p className="font-semibold">Upload Failed</p>
                    <p className="text-sm">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Invitations Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your candidates will receive email invitations to join the recruitment group.
                  </p>
                  <div className="flex justify-center gap-6 text-center">
                    <div className="bg-white rounded-xl p-4 min-w-[100px] shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{result.sent}</div>
                      <div className="text-sm text-gray-500">Invites Sent</div>
                    </div>
                    {result.failed > 0 && (
                      <div className="bg-white rounded-xl p-4 min-w-[100px] shadow-sm">
                        <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                        <div className="text-sm text-gray-500">Failed</div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={resetForm}
                    className="mt-6 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Send More Invitations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Invitations include secure links to join the recruitment group. Candidates have 7 days to accept.</p>
        </div>
      </div>
    </div>
  );
}
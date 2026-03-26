"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/axios";
import Image from "next/image";
import * as XLSX from "xlsx";
import IntegrityBadge from '@/components/IntegrityBadge';
import IntegrityLogViewer from '@/components/IntegrityLogViewer';
import React from 'react';
import BackButton from "@/components/BackButton";

export default function CandidatesManagerPage() {
  const { jobGroupId } = useParams();
  const [jobGroup, setJobGroup] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [topN, setTopN] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    interviewStatus: "",
    minScore: "",
    maxScore: "",
    skill: "",
    experienceMin: "",
    experienceMax: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "totalScore", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [batchStatus, setBatchStatus] = useState("");

  // Export columns
  const allColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "interviewStatus", label: "Interview Status" },
    { key: "totalScore", label: "Total Score" },
    { key: "skills", label: "Skills" },
    { key: "experienceYears", label: "Experience (Years)" },
  ];
  const [selectedColumns, setSelectedColumns] = useState(allColumns.map((c) => c.key));

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get(`/recruiter/jobgroup/${jobGroupId}/candidates`);
        setJobGroup(res.data.jobGroup);
        setCandidates(
          res.data.candidates.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        );
      } catch (err) {
        console.error("Error fetching candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [jobGroupId]);

  // Toggle selection
  const toggleSelect = (appId) => {
    setSelectedIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  // Select Top-N candidates
  const selectTopCandidates = () => {
    const n = parseInt(topN);
    if (!n || n <= 0) return;
    const topCandidates = candidates.slice(0, n).map((c) => c.applicationId);
    setSelectedIds(topCandidates);
  };

  // Shortlist selected
  const handleShortlist = async () => {
    if (!selectedIds.length) return alert("Select candidates first!");
    try {
      await api.post(`/recruiter/jobgroup/${jobGroupId}/shortlist`, { candidateIds: selectedIds });
      alert(`${selectedIds.length} candidates shortlisted!`);
      setSelectedIds([]);
      const res = await api.get(`/recruiter/jobgroup/${jobGroupId}/candidates`);
      setCandidates(res.data.candidates.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)));
    } catch (err) {
      console.error(err);
      alert("Failed to shortlist candidates.");
    }
  };

  // Update batch status
  const handleUpdateStatus = async () => {
    if (!selectedIds.length) return alert("Select candidates first!");
    if (!batchStatus) return alert("Select a status to update");
    try {
      await api.post(`/recruiter/jobgroup/${jobGroupId}/update-status`, {
        candidateIds: selectedIds,
        status: batchStatus,
      });
      alert(`${selectedIds.length} candidates updated to "${batchStatus}"`);
      setSelectedIds([]);
      setBatchStatus("");
      const res = await api.get(`/recruiter/jobgroup/${jobGroupId}/candidates`);
      setCandidates(res.data.candidates.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Export selected candidates
  const exportSelected = () => {
    if (!selectedIds.length) return alert("Select candidates to export!");

    const dataToExport = candidates
      .filter((c) => selectedIds.includes(c.applicationId))
      .map((c) => {
        const row = {};
        selectedColumns.forEach((col) => {
          row[col] = Array.isArray(c[col]) ? c[col].join(", ") : c[col] ?? "";
        });
        return row;
      });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, `Candidates_JobGroup_${jobGroupId}.xlsx`);
  };

  // Filter & sort
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];

    if (filters.status) list = list.filter((c) => c.status === filters.status);
    if (filters.interviewStatus) list = list.filter((c) => c.interviewStatus === filters.interviewStatus);
    if (filters.minScore) list = list.filter((c) => c.totalScore >= parseFloat(filters.minScore));
    if (filters.maxScore) list = list.filter((c) => c.totalScore <= parseFloat(filters.maxScore));
    if (filters.skill) list = list.filter((c) => c.skills?.includes(filters.skill));
    if (filters.experienceMin) list = list.filter((c) => c.experienceYears >= parseFloat(filters.experienceMin));
    if (filters.experienceMax) list = list.filter((c) => c.experienceYears <= parseFloat(filters.experienceMax));

    if (sortConfig.key) {
      list.sort((a, b) => {
        const valA = a[sortConfig.key] ?? 0;
        const valB = b[sortConfig.key] ?? 0;
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [candidates, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const paginatedCandidates = filteredCandidates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  if (!jobGroup)
    return <div className="flex items-center justify-center min-h-screen text-gray-600">Job Group not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton href={`/recruiter/candidate-pool/jobgroup/${jobGroupId}`} />
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{jobGroup.title}</h1>
              <p className="text-gray-600 mt-1">Candidate Management Dashboard</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
              <div className="text-sm text-gray-600">Total Candidates</div>
              <div className="text-2xl font-bold text-gray-900">{candidates.length}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Selected</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{selectedIds.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Top Score</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {candidates[0]?.totalScore || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Avg Score</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {candidates.length ? (candidates.reduce((acc, c) => acc + (c.totalScore || 0), 0) / candidates.length).toFixed(1) : 0}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Current Page</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={filters.maxScore}
                  onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="enrolled">Enrolled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interview Status</label>
              <select
                value={filters.interviewStatus}
                onChange={(e) => setFilters({ ...filters, interviewStatus: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="">All Interviews</option>
                <option value="not-scheduled">Not Scheduled</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Years"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={filters.experienceMin}
                  onChange={(e) => setFilters({ ...filters, experienceMin: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Max Years"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={filters.experienceMax}
                  onChange={(e) => setFilters({ ...filters, experienceMax: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Search</label>
            <input
              type="text"
              placeholder="Enter skill keyword..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            />
          </div>
        </div>

        {/* Batch Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch Operations</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Top N"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
              />
              <button
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all font-medium"
                onClick={selectTopCandidates}
              >
                Select Top
              </button>
            </div>

            <button
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleShortlist}
              disabled={!selectedIds.length}
            >
              Shortlist Selected ({selectedIds.length})
            </button>

            <div className="flex items-center gap-2">
              <select
                value={batchStatus}
                onChange={(e) => setBatchStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="">Update Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="enrolled">Enrolled</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpdateStatus}
                disabled={!selectedIds.length || !batchStatus}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-medium text-gray-700">Export Columns:</span>
              {allColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.key)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedColumns((prev) => [...prev, col.key]);
                      else setSelectedColumns((prev) => prev.filter((k) => k !== col.key));
                    }}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 transition-all"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
            <button
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              onClick={exportSelected}
              disabled={!selectedIds.length}
            >
              Export Selected ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedCandidates.length && paginatedCandidates.length > 0}
                      onChange={() => {
                        if (selectedIds.length === paginatedCandidates.length) setSelectedIds([]);
                        else setSelectedIds(paginatedCandidates.map((c) => c.applicationId));
                      }}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSortConfig({ key: "name", direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
                  >
                    <div className="flex items-center gap-1">
                      Candidate
                      {sortConfig.key === "name" && (
                        <span className="text-xs">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSortConfig({ key: "totalScore", direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
                  >
                    <div className="flex items-center gap-1">
                      Total Score
                      {sortConfig.key === "totalScore" && (
                        <span className="text-xs">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Interview Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedCandidates.map((c) => (
                  <React.Fragment key={c.applicationId}>
                  <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.applicationId)}
                        onChange={() => toggleSelect(c.applicationId)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 transition-all"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <Image 
                            src={c.avatar} 
                            alt={c.name} 
                            width={40} 
                            height={40} 
                            className="rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200">
                            {c.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="relative group/candidate">
                          <span className="font-medium text-gray-900">{c.name}</span>
                          {c.aiOverallScore && (
                            <div className="absolute left-0 top-full mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover/candidate:opacity-100 group-hover/candidate:visible transition-all duration-200 z-10 min-w-48">
                              <div className="text-sm font-semibold text-gray-900 mb-2">AI Assessment</div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Technical:</span>
                                  <span className="font-medium text-gray-900">{c.aiOverallScore.technical ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Communication:</span>
                                  <span className="font-medium text-gray-900">{c.aiOverallScore.communication ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Confidence:</span>
                                  <span className="font-medium text-gray-900">{c.aiOverallScore.confidence ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Logic:</span>
                                  <span className="font-medium text-gray-900">{c.aiOverallScore.logic ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Traits:</span>
                                  <span className="font-medium text-gray-900">{c.aiOverallScore.traits ?? 0}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {c.totalScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        c.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                        c.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        c.status === 'enrolled' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        c.interviewStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        c.interviewStatus === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        c.interviewStatus === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                        c.interviewStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.interviewStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.interviewLogId ? (
                        <IntegrityBadge sessionId={c.interviewLogId} />
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                  {/* Integrity Log Viewer Row */}
                    <tr className="bg-gray-50/30">
                      <td colSpan="8" className="px-6 py-2 border-b border-gray-100">
                        <IntegrityLogViewer sessionId={c.interviewLogId || c.candidateId} candidateName={c.name} />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedCandidates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <span>←</span>
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
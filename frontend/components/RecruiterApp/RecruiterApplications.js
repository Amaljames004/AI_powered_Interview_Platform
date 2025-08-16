'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';

const statusColors = {
  pending: 'bg-gray-300 text-gray-800',
  shortlisted: 'bg-blue-300 text-blue-800',
  enrolled: 'bg-green-300 text-green-800',
  rejected: 'bg-red-300 text-red-800',
};

export default function RecruiterApplications({ jobGroupId }) {
  const { loading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && jobGroupId) fetchApplications();
  }, [jobGroupId, statusFilter, sortBy, order, loading]);

  const fetchApplications = async () => {
    try {
      setLoadingData(true);
      const res = await api.get(`/applications/jobgroup/${jobGroupId}`, {
        params: { status: statusFilter, sortBy, order },
      });
      setApplications(res.data);
      setSelected([]);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const bulkUpdateStatus = async (newStatus) => {
    if (!selected.length) return;
    try {
      await api.put('/applications/bulk-update', {
        applicationIds: selected,
        status: newStatus,
      });
      fetchApplications();
    } catch (err) {
      console.error('Bulk update error:', err);
    }
  };

  const updateSingleStatus = async (id, newStatus) => {
    try {
      await api.put(`/applications/update/${id}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="enrolled">Enrolled</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="createdAt">Created At</option>
          <option value="status">Status</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => bulkUpdateStatus('shortlisted')}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Shortlist Selected
          </button>
          <button
            onClick={() => bulkUpdateStatus('enrolled')}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Enroll Selected
          </button>
          <button
            onClick={() => bulkUpdateStatus('rejected')}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Reject Selected
          </button>
        </div>
      </div>

      {/* Application Table */}
      {loadingData ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table className="min-w-full border border-gray-200 shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Select</th>
              <th className="p-2 border">Candidate</th>
              <th className="p-2 border">Resume</th>
              <th className="p-2 border">Mini Project</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selected.includes(app._id)}
                    onChange={() => toggleSelect(app._id)}
                  />
                </td>
                <td className="p-2 border font-medium">{app.candidate?.name}</td>
                <td className="p-2 border">
                  {app.resume ? (
                    <a href={app.resume} target="_blank" className="text-blue-600 underline">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="p-2 border">
                  {app.miniProjectLink ? (
                    <a href={app.miniProjectLink} target="_blank" className="text-blue-600 underline">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-2 border flex justify-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateSingleStatus(app._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

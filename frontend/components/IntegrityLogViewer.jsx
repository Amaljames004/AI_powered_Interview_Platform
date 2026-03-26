'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';

export default function IntegrityLogViewer({ sessionId, candidateName }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Only render for recruiters
  if (user?.role !== 'recruiter') return null;

  useEffect(() => {
    if (!sessionId) return;
    api.get(`/integrity/session/${sessionId}`)
      .then(res => setLogs(res.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const high = logs.filter(l => l.severity === 'high').length;
  const medium = logs.filter(l => l.severity === 'medium').length;
  const low = logs.filter(l => l.severity === 'low').length;
  const total = logs.length;

  const getBadge = () => {
    if (total === 0) return { label: 'Clean', color: 'bg-green-100 text-green-800 border-green-300' };
    if (high > 0 || total >= 3) return { label: `Flagged (${total})`, color: 'bg-red-100 text-red-800 border-red-300' };
    return { label: `Warning (${total})`, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  };

  const badge = getBadge();

  const typeLabel = {
    tab_switch: 'Tab Switch',
    window_blur: 'Window Blur',
    face_absent: 'Face Absent',
    multiple_faces: 'Multiple Faces',
    screen_share_detected: 'Screen Share'
  };

  const severityRow = {
    high: 'bg-red-50 border-l-4 border-red-400',
    medium: 'bg-yellow-50 border-l-4 border-yellow-400',
    low: 'bg-gray-50 border-l-4 border-gray-300'
  };

  return (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            🔍 Integrity Report {candidateName ? `— ${candidateName}` : ''}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
            {loading ? 'Loading...' : badge.label}
          </span>
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 py-3 bg-white">
          {loading ? (
            <p className="text-sm text-gray-400">Loading logs...</p>
          ) : total === 0 ? (
            <p className="text-sm text-green-600 font-medium">✅ No integrity violations detected.</p>
          ) : (
            <>
              {/* Summary */}
              <div className="flex gap-4 mb-3 text-xs font-medium">
                <span className="text-red-600">{high} High</span>
                <span className="text-yellow-600">{medium} Medium</span>
                <span className="text-gray-500">{low} Low</span>
                <span className="text-gray-400">({total} total)</span>
              </div>
              {/* Log table */}
              <div className="rounded overflow-hidden border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600">
                      <th className="text-left px-3 py-2">Time</th>
                      <th className="text-left px-3 py-2">Event</th>
                      <th className="text-left px-3 py-2">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i} className={severityRow[log.severity]}>
                        <td className="px-3 py-2 text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-700">
                          {typeLabel[log.type] || log.type}
                        </td>
                        <td className="px-3 py-2 capitalize font-semibold">
                          <span className={
                            log.severity === 'high' ? 'text-red-600' :
                            log.severity === 'medium' ? 'text-yellow-600' : 'text-gray-500'
                          }>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';

/**
 * IntegrityBadge — Displays a severity-aware badge for a session.
 * - 0 violations → green "Clean"
 * - 1–2 medium/low, no high → yellow "Warning (N)"
 * - Any high OR 3+ total → red "Flagged (N)"
 *
 * @param {Object} props
 * @param {string} props.sessionId - Interview session ID
 */
export default function IntegrityBadge({ sessionId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        const res = await api.get(`/integrity/session/${sessionId}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch integrity logs:', err);
        setData({ totalViolations: 0, highCount: 0, mediumCount: 0, lowCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [sessionId]);

  if (loading) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        ...
      </span>
    );
  }

  if (!data) return null;

  const { totalViolations, highCount } = data;

  // Any high-severity OR 3+ total → Red Flagged
  if (highCount > 0 || totalViolations >= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Flagged ({totalViolations})
      </span>
    );
  }

  // 1–2 medium/low → Yellow Warning
  if (totalViolations >= 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Warning ({totalViolations})
      </span>
    );
  }

  // 0 violations → Green Clean
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Clean
    </span>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useParams } from 'next/navigation';
import BackButton from '@/components/BackButton';

export default function InviteProgressPage() {
  const params = useParams();
  const routeJobGroupId = params?.jobGroupId || '';
  const [jobGroupId, setJobGroupId] = useState(routeJobGroupId);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    let interval;

    if (jobGroupId && isPolling) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/invite/progress/${jobGroupId}`);
          setProgress(res.data);
        } catch (err) {
          console.error('Progress fetch failed:', err);
          setError('Failed to fetch progress');
          clearInterval(interval);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => clearInterval(interval);
  }, [jobGroupId, isPolling]);

  const handleStartTracking = () => {
    if (!jobGroupId.trim()) {
      setError('Please enter a valid Job Group ID');
      return;
    }
    setProgress(null);
    setError('');
    setIsPolling(true);
  };

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 rounded-xl shadow-md border">
      <BackButton href={`/recruiter/candidate-pool/jobgroup/${routeJobGroupId || 'fallback'}/upload`} />
      <h1 className="text-2xl font-bold mb-4 text-center">📊 Invite Upload Progress</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Job Group ID:</label>
        <input
          type="text"
          value={jobGroupId}
          onChange={(e) => setJobGroupId(e.target.value)}
          placeholder="Enter jobGroupId"
          className="w-full border rounded-md p-2"
        />
      </div>

      <button
        onClick={handleStartTracking}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        Start Tracking
      </button>

      {error && <p className="text-red-500 mt-3 text-center">{error}</p>}

      {progress && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold mb-2">
            Status: {progress.done ? '✅ Completed' : '⏳ In Progress'}
          </p>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (progress.processed / progress.total) * 100 || 0,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 text-sm text-gray-700">
            <p>
              Processed: {progress.processed} / {progress.total}
            </p>
            <p>✅ Sent: {progress.sent}</p>
            <p>❌ Failed: {progress.failed}</p>
          </div>
        </div>
      )}
    </div>
  );
}

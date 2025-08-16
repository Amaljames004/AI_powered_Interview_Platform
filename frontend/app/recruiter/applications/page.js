'use client';

import { useEffect, useState } from 'react';
import { FiBriefcase, FiCode, FiUsers, FiCalendar, FiChevronRight } from 'react-icons/fi';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';

// Custom loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const [jobGroups, setJobGroups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchJobGroups();
  }, [authLoading]);

  const fetchJobGroups = async () => {
    try {
      setLoadingData(true);
      setError(null);
      const { data } = await api.get('/jobgroups/my');
      setJobGroups(data);
    } catch (err) {
      console.error('Failed to fetch job groups', err);
      setError('Failed to load your job groups. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Job Groups</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your recruitment campaigns and track applications
              </p>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchJobGroups}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!loadingData && jobGroups.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FiBriefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No job groups yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first job group.</p>
            <div className="mt-6">
              <Link
                href="/recruiter/create-job-group"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Job Group
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Job Groups</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your recruitment campaigns and track applications
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/recruiter/create-job-group"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {jobGroups.map((group) => (
              <li key={group._id}>
                <Link
                  href={`/recruiter/applications/${group._id}`}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="px-6 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <FiBriefcase className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <h2 className="ml-3 text-lg font-medium text-gray-900 truncate">
                            {group.title}
                          </h2>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiCode className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {group.joinCode}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>Deadline: {formatDate(group.deadline)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiUsers className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>
                              {group.applications?.length || 0} application
                              {group.applications?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <FiChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
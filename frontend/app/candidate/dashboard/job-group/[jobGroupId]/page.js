"use client";
import React from "react";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthProvider";
import { useParams } from "next/navigation";

export default function JobDetailsPage() {
  const params = useParams();
  const jobGroupId = params.jobGroupId;
  const { loading: authLoading, user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    async function fetchData() {
      try {
        const res = await api.get(`/jobgroups/${jobGroupId}/full`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.response?.data?.message || "Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [jobGroupId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900">
        Loading job details...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900">
        {errorMsg}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900">
        Job details not found.
      </div>
    );
  }

  const { company, jobGroup } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
          <div className="flex-shrink-0">
            <img
              src={company.logo || "/default-logo.png"}
              alt={company.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{jobGroup.title}</h1>
            <h2 className="text-xl text-gray-700">{company.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {company.industry}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {company.location || "Remote"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Job Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-700">
              {jobGroup.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                <p className="mt-1 text-sm text-gray-900">{company.industry}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-sm text-gray-900">{company.location || "Not specified"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {company.website ? (
                    <a href={company.website} target="_blank" className="text-blue-600 hover:underline">
                      {company.website}
                    </a>
                  ) : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hiring Policies</h3>
                <p className="mt-1 text-sm text-gray-900">{company.hiringPolicies || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {jobGroup.skillsRequired.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {jobGroup.skillsRequired.map((skill, index) => (
                  <div key={index} className="relative">
                    <span className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {skill.skillName}
                      {skill.weightage && (
                        <span className="ml-2 text-xs text-gray-500">{skill.weightage}%</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Deadline</h2>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">
                {new Date(jobGroup.deadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
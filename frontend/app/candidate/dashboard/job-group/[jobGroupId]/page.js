"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import {
  FiMapPin,
  FiGlobe,
  FiBriefcase,
  FiCalendar,
} from "react-icons/fi";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobGroupId = params?.jobGroupId;
  const { loading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!jobGroupId) {
      setErrorMsg("No job id provided");
      setLoading(false);
      return;
    }

    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const res = await api.get(`/recruitment/${jobGroupId}/full`);
        if (!mounted) return;
        setData(res.data);
      } catch (err) {
        console.error("Fetch job group error:", err);
        setErrorMsg(err?.response?.data?.message || "Failed to fetch job details");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
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

  if (!data || !data.jobGroup) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900">
        Job details not found.
      </div>
    );
  }

  const company = data.company || {};
  const job = data.jobGroup || {};

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Company Info */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start gap-6">
            <img
              src={company.logo || "/default-logo.png"}
              alt={company.name || "Company"}
              onError={(e) => (e.currentTarget.src = "/default-logo.png")}
              className="w-24 h-24 rounded-xl object-cover border border-gray-200"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {company.name || "Unknown Company"}
              </h2>
              <p className="text-gray-600 mt-1">{company.industry || "Industry not specified"}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiMapPin className="text-gray-500" />
                  {company.location || "Location not specified"}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiGlobe className="text-gray-500" />
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    "Website not available"
                  )}
                </div>
              </div>

              {company.hiringPolicies && (
                <p className="mt-4 text-sm text-gray-700">
                  <span className="font-medium">Hiring Policies: </span>
                  {company.hiringPolicies}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <p className="text-gray-600">{job.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <FiBriefcase className="text-gray-500" />
              Employment Type:{" "}
              <span className="font-medium capitalize">{job.employmentType}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FiBriefcase className="text-gray-500" />
              Seniority:{" "}
              <span className="font-medium capitalize">{job.seniority}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FiBriefcase className="text-gray-500" />
              Work Mode:{" "}
              <span className="font-medium capitalize">{job.workMode}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FiBriefcase className="text-gray-500" />
              Status: <span className="font-medium">{job.status}</span>
            </div>
          </div>

          {/* Salary */}
          {job.salary && (job.salary.min || job.salary.max) && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
              <p className="text-gray-800 font-medium">Compensation</p>
              <p className="text-gray-600">
                {job.salary.currency} {job.salary.min ?? "—"}{" "}
                {job.salary.max ? `— ${job.salary.max}` : ""}
                {job.salary.isNegotiable === false ? " · Fixed" : " · Negotiable"}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-6">
            <div className="flex items-start gap-2 text-gray-700">
              <FiCalendar className="text-gray-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Application Deadline</p>
                <p className="font-medium">{formatDate(job.timeline?.applicationDeadline)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <FiCalendar className="text-gray-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Interview Start</p>
                <p className="font-medium">{formatDate(job.timeline?.interviewStart)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <FiCalendar className="text-gray-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Final Decision</p>
                <p className="font-medium">{formatDate(job.timeline?.finalDecision)}</p>
              </div>
            </div>
          </div>

          {/* Back button only */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:shadow"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

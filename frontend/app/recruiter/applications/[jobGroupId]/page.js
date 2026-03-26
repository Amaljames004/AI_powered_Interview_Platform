'use client';

import { useParams } from 'next/navigation';
import RecruiterApplications from '@/components/RecruiterApp/RecruiterApplications';
import BackButton from '@/components/BackButton';

export default function JobGroupApplicationsPage() {
  const params = useParams();
  const jobGroupId = params.jobGroupId;

  console.log("JobGroupApplicationsPage params:", params);
  console.log("JobGroupId:", jobGroupId);

  if (!jobGroupId) return <p>No job group selected.</p>;
  return (
    <>
      <div className="max-w-7xl mx-auto pt-6 px-6">
        <BackButton href="/recruiter/applications" />
      </div>
      <RecruiterApplications jobGroupId={jobGroupId} />
    </>
  );
}

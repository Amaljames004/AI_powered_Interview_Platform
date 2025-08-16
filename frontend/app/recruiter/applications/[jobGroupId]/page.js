'use client';

import { useParams } from 'next/navigation';
import RecruiterApplications from '@/components/RecruiterApp/RecruiterApplications';

export default function JobGroupApplicationsPage() {
  const params = useParams();
  const jobGroupId = params.jobGroupId;

  console.log("JobGroupApplicationsPage params:", params);
  console.log("JobGroupId:", jobGroupId);

  if (!jobGroupId) return <p>No job group selected.</p>;

  return <RecruiterApplications jobGroupId={jobGroupId} />;
}

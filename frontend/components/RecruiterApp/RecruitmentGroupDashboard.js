import React from "react";
import { useNavigate, useParams } from "react-router-dom";

function RecruitmentGroupDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate(`/recruiter/candidate-pool/jobgroup/${jobGroupId}/upload`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Recruitment Group Dashboard: {id}</h2>
      <p className="mb-6 text-gray-600">
        View details and manage candidates for this recruitment group.
      </p>

      <button
        onClick={handleUploadClick}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Upload Candidates
      </button>
    </div>
  );
}

export default RecruitmentGroupDashboard;

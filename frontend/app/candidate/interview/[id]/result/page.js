"use client";

import { useRouter } from "next/navigation";

export default function InterviewResultPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">🎉 Interview Completed!</h1>
        <p className="mb-6 text-gray-700">
          Thank you for completing your interview.
        </p>

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

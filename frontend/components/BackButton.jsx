'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ href }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
    >
      ← Back
    </button>
  );
}

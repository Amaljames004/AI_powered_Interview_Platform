import { FaTools, FaClock } from 'react-icons/fa';

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden  ">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="bg-blue-100 p-4 rounded-full inline-block mb-6">
          <FaTools className="text-gray-600 text-4xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page in Progress</h1>
        <p className="text-gray-600 mb-6">We're currently working on this page. Please check back soon!</p>
        
        <div className="flex items-center justify-center text-blue-600">
          <FaClock className="mr-2" />
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
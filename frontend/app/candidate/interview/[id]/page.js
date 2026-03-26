"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/axios";
import { 
  FiClock, 
  FiBriefcase, 
  FiCamera, 
  FiMic, 
  FiWifi, 
  FiCheck, 
  FiX, 
  FiAlertTriangle,
  FiEye,
  FiUser,
  FiAward,
  FiInfo
} from "react-icons/fi";

export default function InterviewDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionsOK, setPermissionsOK] = useState(false);
  const [checking, setChecking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [systemChecks, setSystemChecks] = useState({
    camera: { status: 'pending', message: 'Camera access required' },
    microphone: { status: 'pending', message: 'Microphone access required' },
    network: { status: 'pending', message: 'Network connection check' },
    browser: { status: 'pending', message: 'Browser compatibility' }
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setInterview(res.data);
      } catch (err) {
        console.error("Failed to fetch interview", err);
        setInterview(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const runSystemChecks = async () => {
    setChecking(true);
    const checks = { ...systemChecks };

    try {
      // Camera check
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTracks = stream.getVideoTracks();
        checks.camera = {
          status: 'success',
          message: `Camera ready (${videoTracks[0]?.label || 'HD Camera'})`
        };
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        checks.camera = { status: 'error', message: 'Camera access denied' };
      }

      // Microphone check
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTracks = stream.getAudioTracks();
        checks.microphone = {
          status: 'success',
          message: `Microphone ready (${audioTracks[0]?.label || 'Default Mic'})`
        };
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        checks.microphone = { status: 'error', message: 'Microphone access denied' };
      }

      // Network check
      if (navigator.onLine) {
        checks.network = { status: 'success', message: 'Stable internet connection' };
      } else {
        checks.network = { status: 'error', message: 'No internet connection' };
      }

      // Browser check
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      if (isChrome || isFirefox) {
        checks.browser = { status: 'success', message: 'Browser supported' };
      } else {
        checks.browser = { status: 'warning', message: 'Use Chrome or Firefox for best experience' };
      }

      setSystemChecks(checks);
      
      // Set permissions OK if camera and mic are working
      if (checks.camera.status === 'success' && checks.microphone.status === 'success') {
        setPermissionsOK(true);
      } else {
        setPermissionsOK(false);
      }
    } catch (err) {
      console.error("System check error:", err);
    } finally {
      setChecking(false);
    }
  };

  const startInterview = async () => {
    if (!permissionsOK) {
      alert("Please complete system checks first.");
      return;
    }
    if (!interview) {
      alert("Interview not loaded.");
      return;
    }

    const startTimeRaw = interview.startTime || interview.date || interview.start;
    const endTimeRaw = interview.endTime;

    if (interview.status === "scheduled" && startTimeRaw && endTimeRaw) {
      const now = new Date();
      const startWindow = new Date(startTimeRaw);
      startWindow.setMinutes(startWindow.getMinutes() - 5);
      const endWindow = new Date(endTimeRaw);

      if (now < startWindow) {
        alert("Interview is not yet open. Please wait until your scheduled time.");
        return;
      }
      if (now > endWindow) {
        alert("The scheduled time for this interview has passed.");
        return;
      }
    }

    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }

    setStarting(true);
    try {
      const candidateId = interview.candidate?._id || interview.candidate || interview.candidateId;
      const jobGroupId = interview.jobGroup?._id || interview.jobGroup || interview.jobGroupId;

      const res = await api.post(`/interview/start`, {
        candidateId,
        jobGroupId,
      });

      const logId = res.data?.logId;
      if (!logId) throw new Error("No logId returned from server");

      router.push(`/candidate/interview/${logId}/start`);
    } catch (err) {
      console.error("Start interview error:", err);
      alert(err.response?.data?.message || "Failed to start interview");
    } finally {
      setStarting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <FiCheck className="text-green-500" />;
      case 'error': return <FiX className="text-red-500" />;
      case 'warning': return <FiAlertTriangle className="text-yellow-500" />;
      default: return <FiInfo className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-gray-600">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <FiAlertTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Interview Not Found</p>
          <p className="text-gray-600 mb-6">The interview session you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push('/candidate/interview-history')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const startTime = interview.startTime || interview.date || interview.start;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Interview Preparation</h1>
            <p className="text-gray-600">Get ready for your assessment</p>
          </div>
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Interview Guidelines */}
          {/* <div className="space-y-6">
            {/* Interview Info Card */}
           
            {/* Guidelines Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiInfo className="text-blue-600" />
                Important Guidelines
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FiEye className="text-blue-600" />
                    Eye Tracking & Attention Monitoring
                  </h4>
                  <p className="text-blue-800 text-sm">
                    Maintain eye contact with the camera. Looking away frequently may affect your attention score.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <FiCamera className="text-purple-600" />
                    Camera Requirements
                  </h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Ensure good lighting on your face</li>
                    <li>• Position camera at eye level</li>
                    <li>• Maintain a professional background</li>
                    <li>• Camera must remain on throughout the interview</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <FiMic className="text-green-600" />
                    Audio Quality
                  </h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Use a quiet environment</li>
                    <li>• Avoid background noise</li>
                    <li>• Speak clearly and at a moderate pace</li>
                    <li>• Microphone must remain active</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    🎯 Scoring Factors
                  </h4>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• Communication skills and clarity</li>
                    <li>• Content relevance and structure</li>
                    <li>• Professional demeanor and eye contact</li>
                    <li>• Confidence and body language</li>
                    <li>• Technical knowledge (role-specific)</li>
                  </ul>
                </div>
              </div>
            </div>

        

          {/* Right Column - System Preparation */}
          <div className="space-y-6">
            {/* System Check Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
                System Preparation
              </h3>

              {/* System Checks */}
              <div className="space-y-4 mb-6">
                {Object.entries(systemChecks).map(([key, check]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className={`text-sm ${getStatusColor(check.status)}`}>
                          {check.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Check Button */}
              <button
                onClick={runSystemChecks}
                disabled={checking}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running System Checks...
                  </>
                ) : (
                  'Run System Checks'
                )}
              </button>
            </div>

            {/* Camera & Mic Preview */}
            {permissionsOK && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  Equipment Preview
                </h3>
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <FiCamera className="text-4xl mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera feed will appear here during interview</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 rounded-lg p-3">
                    <FiCamera className="text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-green-800">Camera Ready</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <FiMic className="text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-green-800">Microphone Ready</p>
                  </div>
                </div>
              </div>
            )}

            {/* Start Interview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Ready to Begin?
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 text-center">
                  Once started, you'll have a limited time to complete each question. 
                  The interview will be recorded and analyzed by our AI system.
                </p>
              </div>

              {interview?.status === "completed" ? (
                <div className="text-center bg-gray-50 p-6 rounded-xl border border-gray-200 mt-2">
                  <p className="text-gray-800 font-semibold mb-4">
                    You have already completed this interview.
                  </p>
                  <button
                    onClick={() => router.push(`/candidate/interview/${id}/result`)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow"
                  >
                    View Results
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={startInterview}
                    disabled={!permissionsOK || starting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
                  >
                    {starting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Starting Interview...
                      </>
                    ) : (
                      <>
                        <FiUser className="text-xl" />
                        Start Interview Now
                      </>
                    )}
                  </button>

                  {!permissionsOK && (
                    <p className="text-red-500 text-sm text-center mt-3">
                      Complete system checks before starting
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Support Info */}
            <div className="text-center text-gray-500 text-sm">
              <p>Having technical issues? Contact support at support@company.com</p>
              <p className="mt-1">Estimated duration: 30-45 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
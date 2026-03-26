'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import api from '@/utils/axios';

/**
 * FaceMonitor — Webcam-based face detection for interview integrity.
 * Uses face-api.js TinyFaceDetector to count faces every 5 seconds.
 *
 * @param {Object} props
 * @param {string} props.sessionId - Current interview session ID
 * @param {string} props.candidateId - Current candidate's user ID
 */
export default function FaceMonitor({ sessionId, candidateId }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'violation'
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const logEvent = useCallback(
    async (type) => {
      if (!sessionId) return;
      try {
        await api.post('/integrity/event', {
          type,
          sessionId,
          candidateId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to log face integrity event:', err);
      }
    },
    [sessionId, candidateId]
  );

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api.js models:', err);
        setStatus('violation');
      }
    };
    loadModels();
  }, []);

  // Start webcam and face detection
  useEffect(() => {
    if (!modelsLoaded) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start periodic face detection every 5 seconds
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;

          try {
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            );

            const faceCount = detections.length;

            if (faceCount === 0) {
              setStatus('violation');
              logEvent('face_absent');
            } else if (faceCount >= 2) {
              setStatus('violation');
              logEvent('multiple_faces');
            } else {
              setStatus('ok');
            }
          } catch (detectionErr) {
            console.error('Face detection error:', detectionErr);
          }
        }, 5000);
      } catch (err) {
        console.error('Webcam access failed:', err);
        setStatus('violation');
      }
    };

    startWebcam();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [modelsLoaded, logEvent]);

  const statusConfig = {
    loading: {
      color: 'bg-amber-400',
      ring: 'ring-amber-200',
      label: 'Initializing...',
    },
    ok: {
      color: 'bg-emerald-500',
      ring: 'ring-emerald-200',
      label: 'Monitoring Active',
    },
    violation: {
      color: 'bg-rose-500',
      ring: 'ring-rose-200',
      label: 'Violation Detected',
    },
  };

  const current = statusConfig[status];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Hidden video element for face detection */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width={320}
        height={240}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Status indicator */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <span className="relative flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.color} opacity-75`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${current.color} ring-2 ${current.ring}`}
          />
        </span>
        <span className="text-xs font-medium text-gray-700">
          {current.label}
        </span>
      </div>
    </div>
  );
}

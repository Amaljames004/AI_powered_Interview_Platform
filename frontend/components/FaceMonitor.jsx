'use client';
import { useEffect, useRef, useState } from 'react';

export default function FaceMonitor({ sessionId, candidateId }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let interval;
    let stream;

    const init = async () => {
      const faceapi = await import('face-api.js');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      interval = setInterval(async () => {
        if (!videoRef.current) return;
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        const count = detections.length;
        if (count === 0) { setStatus('absent'); logEvent('face_absent'); }
        else if (count >= 2) { setStatus('multiple'); logEvent('multiple_faces'); }
        else { setStatus('ok'); }
      }, 5000);
    };

    const logEvent = async (type) => {
      try {
        const { default: api } = await import('@/utils/axios');
        await api.post('/integrity/event', { type, sessionId, candidateId, timestamp: new Date() });
      } catch (e) {}
    };

    init().catch(console.error);
    return () => {
      clearInterval(interval);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [mounted]);

  if (!mounted) return null;

  const dot = status === 'ok' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      <span>{status === 'ok' ? 'Face detected' : status === 'loading' ? 'Starting camera...' : 'Face alert'}</span>
      <video ref={videoRef} className="hidden" muted playsInline />
    </div>
  );
}

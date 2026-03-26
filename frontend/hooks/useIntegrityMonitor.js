'use client';

import { useRef, useCallback } from 'react';
import api from '@/utils/axios';

/**
 * Custom hook that monitors browser-level integrity signals during an interview.
 * Detects tab switches and window blur events.
 *
 * @returns {{ startMonitoring, stopMonitoring }}
 */
export default function useIntegrityMonitor(onViolation) {
  const sessionIdRef = useRef(null);
  const candidateIdRef = useRef(null);
  const listenersAttachedRef = useRef(false);

  const logEvent = useCallback(async (type) => {
    if (!sessionIdRef.current) return;
    if (onViolation) onViolation(type);
    try {
      await api.post('/integrity/event', {
        type,
        sessionId: sessionIdRef.current,
        candidateId: candidateIdRef.current,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to log integrity event:', err);
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      logEvent('tab_switch');
    }
  }, [logEvent]);

  const handleWindowBlur = useCallback(() => {
    logEvent('window_blur');
  }, [logEvent]);

  const startMonitoring = useCallback(
    (sessionId, candidateId) => {
      sessionIdRef.current = sessionId;
      candidateIdRef.current = candidateId;

      if (listenersAttachedRef.current) return;
      listenersAttachedRef.current = true;

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
    },
    [handleVisibilityChange, handleWindowBlur]
  );

  const stopMonitoring = useCallback(() => {
    if (!listenersAttachedRef.current) return;
    listenersAttachedRef.current = false;

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);

    sessionIdRef.current = null;
    candidateIdRef.current = null;
  }, [handleVisibilityChange, handleWindowBlur]);

  return { startMonitoring, stopMonitoring };
}

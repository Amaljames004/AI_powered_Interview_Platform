"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthProvider";
import useIntegrityMonitor from "@/hooks/useIntegrityMonitor";
import FaceMonitor from "@/components/FaceMonitor";

export default function InterviewStartPage() {
  const { id } = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const handleViolationRef = useRef(null);
  const { startMonitoring, stopMonitoring } = useIntegrityMonitor((type) => {
    if (handleViolationRef.current) handleViolationRef.current(type);
  });
  const initialIndex = Number(search?.get("index") || 0);

  // Constraint 1: Redirect recruiters away from interview
  useEffect(() => {
    if (!authLoading && user?.role === "recruiter") {
      router.replace("/recruiter/dashboard");
    }
  }, [authLoading, user, router]);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(initialIndex);
  const [thinkingTime, setThinkingTime] = useState(10);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isThinking, setIsThinking] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [mediaError, setMediaError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [ttsReady, setTtsReady] = useState(false);

  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const isSubmittingRef = useRef(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const isRecordingRef = useRef(false);
  const currentAnswerRef = useRef("");

  const feedbackMessages = [
    "Great job! Ready for the next question?",
    "Well done! Let's continue to the next challenge.",
    "Excellent! Moving on to the next question.",
    "Good answer! Next question coming up.",
    "Nice work! Ready for the next one?"
  ];

  // Check TTS support and initialize
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsReady(true);
      
      // Preload voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setTtsReady(true);
        }
      };
      
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    } else {
      console.warn("Text-to-speech not supported in this browser");
    }
  }, []);

  // Fetch interview data and start integrity monitoring
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        if (res.data.status === "completed") {
          router.replace(`/candidate/interview/${id}/result`);
          return;
        }
        setInterview(res.data);

        // Start integrity monitoring
        const candidateId = res.data.candidate?._id || res.data.candidate;
        if (id && candidateId) {
          startMonitoring(id, candidateId);
        }
        
        // Auto-enter fullscreen
        try {
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (err) {
          console.warn('Fullscreen blocked by browser, user needs to interact first', err);
        }

        // Speak first question after data loads
        if (res.data.questions && res.data.questions.length > 0 && ttsReady) {
          setTimeout(() => {
            speakQuestion(res.data.questions[0].question);
          }, 1000);
        }
      } catch (err) {
        console.error("Interview fetch error:", err.response?.data || err);
        setInterview(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInterview();

    return () => {
      stopMonitoring();
    };
  }, [id, ttsReady, startMonitoring, stopMonitoring]);

  // Integrity warning handler
  useEffect(() => {
    handleViolationRef.current = (type) => {
      if (isSubmittingRef.current) return;
      
      setWarningCount((prev) => {
        const nextCount = prev + 1;
        let reason = type === 'tab_switch' ? 'You switched tabs or minimized the window.' : 'You clicked outside the interview window.';
        if (type === 'fullscreen_exit') reason = 'You exited fullscreen.';

        if (nextCount === 1) {
          setWarningMessage(`${reason} Warning 1 of 2: Do not switch tabs or leave the window.`);
          setShowWarningModal(true);
        } else if (nextCount === 2) {
          setWarningMessage(`${reason} Warning 2 of 2: Final warning. Next violation will auto-submit.`);
          setShowWarningModal(true);
        } else if (nextCount >= 3) {
          setWarningMessage(`Integrity violation. Auto-submitting interview...`);
          setShowWarningModal(true);
          submitAllAnswers(); // We can call this directly since the ref holds the latest
        }
        return nextCount;
      });
    };
  }, []);

  // Fullscreen monitor
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current) {
        if (handleViolationRef.current) handleViolationRef.current('fullscreen_exit');
        try {
          document.documentElement.requestFullscreen();
        } catch(e) {}
      }
    };
    
    // Prevent context menu (right-click) globally
    const handleContextMenu = (e) => e.preventDefault();

    // Prevent key combinations (DevTools, Copy, Paste, PrintScreen)
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'p', 'i'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['c', 'v', 'x', 'p', 'i'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };

    // Prevent copy/paste/cut globally via events
    const handleCopyPaste = (e) => {
      e.preventDefault();
      alert("Clipboard actions are disabled during the interview.");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
    };
  }, []);

  // Setup webcam
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setMediaError("Camera or microphone access is required for this interview"));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Thinking timer
  useEffect(() => {
    if (!isThinking) return;
    if (thinkingTime <= 0) {
      setIsThinking(false);
      handleStartRecording();
      return;
    }
    const timer = setInterval(() => setThinkingTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isThinking, thinkingTime]);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft <= 0) {
      stopRecordingAndSave();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  // Text-to-speech function
  const speakQuestion = (questionText) => {
    if (!ttsReady) {
      console.warn("TTS not ready");
      return;
    }

    // Stop any ongoing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(questionText);
    utteranceRef.current = utter;

    // Configure voice settings
    utter.rate = 0.9; // Slightly slower for clarity
    utter.pitch = 1;
    utter.volume = 1;

    // Try to select a good voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.localService === false
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
    
    if (englishVoice) {
      utter.voice = englishVoice;
    }

    utter.onend = () => {
      console.log("Finished speaking question");
      utteranceRef.current = null;
    };

    utter.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utter);
  };

// Start recording / speech recognition
const handleStartRecording = () => {
  if (!streamRef.current) {
    setMediaError("No audio/video stream available");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser does not support speech recognition. Use Chrome.");
    return;
  }

  // Reset transcript for new question
  setTranscript("");
  setLiveTranscript("");
  currentAnswerRef.current = "";
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const tr = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += tr + ' ';
      } else {
        interimText += tr;
      }
    }
    const combined = finalTranscript + interimText;
    currentAnswerRef.current = combined;
    setTranscript(combined);
    setLiveTranscript(interimText || 'Listening...');
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech' && isRecordingRef.current) {
        try { recognition.start(); } catch(e) {}
    }
    if (event.error === 'network') setLiveTranscript('Network error - check connection');
  };

  recognition.onend = () => {
    // Auto restart if still in recording mode
    if (isRecordingRef.current) {
       try { recognition.start(); } catch(e) {}
    }
  };

  recognitionRef.current = recognition;
  recognition.start();
  setIsRecording(true);
  isRecordingRef.current = true;
  setTimeLeft(120);
};

  const stopRecordingAndSave = () => {
    if (!isRecording) return;
    setIsRecording(false);
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setLiveTranscript("");

    const currentQ = interview.questions[index];
    const finalAnswer = currentAnswerRef.current || transcript || "No answer provided";
    currentAnswerRef.current = "";

    const answerObj = {
      questionId: currentQ._id,
      answerText: finalAnswer,
      answerMode: "text",
    };

    setAnswers((prev) => {
      const next = [...prev];
      next[index] = answerObj;
      return next;
    });

    setTranscript("");

    // Give random feedback message
    const randomMsg = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
    setFeedback(randomMsg);

    // Speak next question using TTS after a delay
    setTimeout(() => {
      const nextQ = interview.questions[index + 1];
      if (nextQ && ttsReady) {
        speakQuestion(nextQ.question);
      }
    }, 1000);

    goNext();
  };

  const handleSkip = () => {
    const currentQ = interview.questions[index];
    const answerObj = {
      questionId: currentQ._id,
      answerText: "No answer provided",
      answerMode: "skipped",
    };

    setAnswers((prev) => {
      const next = [...prev];
      next[index] = answerObj;
      return next;
    });

    const randomMsg = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
    setFeedback(randomMsg);

    // Speak next question
    setTimeout(() => {
      const nextQ = interview.questions[index + 1];
      if (nextQ && ttsReady) {
        speakQuestion(nextQ.question);
      }
    }, 1000);

    goNext();
  };

  const goNext = () => {
    const total = interview.questions.length;
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setThinkingTime(10);
      setIsThinking(true);
    } else {
      submitAllAnswers();
    }
  };

  const submitAllAnswers = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSaving(true);
    stopMonitoring();
    
    // Stop transcription if still going
    if (recognitionRef.current) recognitionRef.current.stop();

    try {
      await api.post("/interview/submit", { logId: id, answers });
      
      // Cleanup events
      try {
        if (document.fullscreenElement) document.exitFullscreen();
      } catch(e) {}
      
      router.push(`/candidate/interview/${id}/result`);
    } catch (err) {
      console.error("Submit Answers Error:", err);
      alert("Failed to submit all answers. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  // Manual TTS trigger for testing
  const handlePlayQuestion = () => {
    if (interview?.questions[index] && ttsReady) {
      speakQuestion(interview.questions[index].question);
    }
  };

  // Block rendering for recruiters
  if (!authLoading && user?.role === "recruiter") {
    return null;
  }

  if (loading || authLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview questions...</p>
        </div>
      </div>
    );
    
  if (!interview)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Not Found</h2>
          <p className="text-gray-600 mb-6">The requested interview could not be loaded.</p>
          <button 
            onClick={() => router.back()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const current = interview.questions[index];
  const totalQs = interview.questions.length;
  const progress = ((index + 1) / totalQs) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 select-none">
      {/* WARNING BANNER */}
      {warningCount > 0 && warningCount < 3 && (
        <div className={`fixed top-0 left-0 w-full z-[100] py-3 px-4 text-center text-white font-bold shadow-md ${warningCount === 1 ? 'bg-yellow-500' : 'bg-orange-500'}`}>
          ⚠️ Warnings: {warningCount}/2 - Please stay in fullscreen and do not switch tabs.
        </div>
      )}

      {/* WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
             <div className="text-red-500 text-5xl mb-4">⚠️</div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Integrity Violation</h3>
             <p className="text-gray-700 mb-6 font-medium">{warningMessage}</p>
             <button 
               onClick={() => {
                 setShowWarningModal(false);
                 try { document.documentElement.requestFullscreen(); } catch(e){}
               }}
               className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-xl font-bold transition-all"
             >
               I Understand - Return to Interview
             </button>
          </div>
        </div>
      )}

      <div className={`max-w-6xl mx-auto ${warningCount > 0 ? "mt-12" : ""}`}>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{interview.jobGroup?.title}</h1>
              <p className="text-gray-600 mt-1">Interview Session</p>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-lg font-semibold text-gray-800">
                Question <span className="text-blue-600">{index + 1}</span> of {totalQs}
              </div>
              <div className="flex items-center gap-4 mt-2">
                {isThinking && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-medium">Thinking: {thinkingTime}s</span>
                  </div>
                )}
                {isRecording && (
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">Recording: {timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">Q</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Current Question</h2>
                {ttsReady && (
                  <button 
                    onClick={handlePlayQuestion}
                    className="ml-auto bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                    title="Play question audio"
                  >
                    🔊
                  </button>
                )}
              </div>
              
              <p className="text-xl text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                {current.question}
              </p>

              {!ttsReady && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    ⚠️ Audio playback not available. Please read the question above.
                  </p>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="text-green-600">💡</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">{feedback}</p>
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="font-medium text-red-700">We're recording your answer</span>
                </div>
              )}

              {/* Saving Indicator */}
              {isSaving && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="font-medium text-blue-700">Submitting your answers...</span>
                </div>
              )}
            </div>

            {/* Controls Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                {!isRecording && !isThinking && !isSaving && (
                  <button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    onClick={() => setIsThinking(true)}
                  >
                    <span>💭</span>
                    Start Thinking Time
                  </button>
                )}
                {isRecording && (
                  <button 
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    onClick={stopRecordingAndSave}
                  >
                    <span>✅</span>
                    Stop Recording & Save
                  </button>
                )}
                {!isRecording && !isThinking && !isSaving && (
                  <button 
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={handleSkip}
                  >
                    Skip Question
                  </button>
                )}
              </div>
            </div>

            {isRecording && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-500 font-medium mb-1">🎤 Live transcription:</p>
                <p className="text-sm text-blue-800">{liveTranscript || 'Listening...'}</p>
              </div>
            )}

            {/* Hidden transcript store for reliable access on stop */}
            <div id="transcript-store" data-value={transcript} style={{display:"none"}} />
            {transcript && !isRecording && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">📝</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Final Transcript</h2>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto">
                  <p className="text-gray-700 leading-relaxed">{transcript}</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">🎥</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Camera Preview</h2>
              </div>
              
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    REC
                  </div>
                )}
              </div>

              {mediaError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{mediaError}</p>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Interview Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Speak clearly and confidently</li>
                  <li>• Maintain eye contact with the camera</li>
                  <li>• Use the thinking time to structure your answer</li>
                  <li>• Stay within the time limit for each question</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Face Monitor for integrity tracking */}
        <FaceMonitor
          sessionId={id}
          candidateId={interview.candidate?._id || interview.candidate}
        />
      </div>
    </div>
  );
}
"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/axios";

export default function InterviewStartPage() {
  const { id } = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const initialIndex = Number(search?.get("index") || 0);

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
  const [mediaError, setMediaError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [ttsReady, setTtsReady] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

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

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setInterview(res.data);
        
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
  }, [id, ttsReady]);

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
      setMediaError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (err) => console.error("Speech recognition error:", err);

    recognition.start();
    setIsRecording(true);
    setTimeLeft(120);
  };

  const stopRecordingAndSave = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();

    const currentQ = interview.questions[index];
    const answerObj = {
      questionId: currentQ._id,
      answerText: transcript || "No answer provided",
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
    setIsSaving(true);
    try {
      await api.post("/interview/submit", { logId: id, answers });
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

  if (loading)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
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

            {/* Transcript Card */}
            {transcript && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">📝</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Live Transcript</h2>
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
      </div>
    </div>
  );
}
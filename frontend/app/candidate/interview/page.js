"use client";
import { useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';
import Head from 'next/head';

// Mock interview questions
const mockQuestions = [
  "Tell me about yourself and your experience.",
  "What are your greatest strengths?",
  "Describe a challenging project you worked on.",
  "How do you handle conflict in the workplace?",
  "Where do you see yourself in 5 years?",
  "What is your approach to learning new technologies?",
];

// Mock feedback data
const mockFeedback = {
  score: 87,
  analysis: [
    { metric: "Clarity", score: 4.2 },
    { metric: "Relevance", score: 4.5 },
    { metric: "Confidence", score: 3.8 },
    { metric: "Technical Accuracy", score: 4.7 },
  ],
  suggestions: [
    "Try to be more concise in your answers",
    "Provide more specific examples when possible",
    "Work on maintaining steady eye contact",
    "Consider practicing with more technical questions"
  ]
};

export default function AIInterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mock recording functionality
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimer(0);
    }
  };

  // Mock playback functionality
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Mock submission to AI
  const submitResponse = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowFeedback(true);
      setIsLoading(false);
    }, 2000);
  };

  // Move to next question
  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % mockQuestions.length);
    setShowFeedback(false);
    setIsRecording(false);
    setIsPlaying(false);
    setTimer(0);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Interview Practice</title>
        <meta name="description" content="Practice your interview skills with AI" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Interview Coach</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Interview Question Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Question {currentQuestion + 1}/{mockQuestions.length}</h2>
              <p className="text-lg text-gray-700">{mockQuestions[currentQuestion]}</p>
            </div>

            {/* Recording Section */}
            <div className="p-6 bg-gray-50">
              <div className="flex flex-col items-center space-y-6">
                {isRecording ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Recording</span>
                  </div>
                ) : (
                  <p className="text-gray-500">Press the microphone to start recording</p>
                )}

                <div className="flex items-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={toggleRecording}
                      className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <FaMicrophone size={24} />
                    </button>
                  ) : (
                    <button
                      onClick={toggleRecording}
                      className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FaStop size={24} />
                    </button>
                  )}

                  {timer > 0 && (
                    <button
                      onClick={togglePlayback}
                      className="p-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                      {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                    </button>
                  )}
                </div>

                {timer > 0 && (
                  <div className="text-gray-500">
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                  </div>
                )}

                {timer > 0 && !showFeedback && (
                  <button
                    onClick={submitResponse}
                    disabled={isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                  >
                    {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                  </button>
                )}
              </div>
            </div>

            {/* Feedback Section */}
            {showFeedback && (
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Feedback</h2>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-medium text-gray-700 mr-2">Overall Score:</span>
                    <div className="relative w-full max-w-xs">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                          style={{ width: `${mockFeedback.score}%` }}
                        ></div>
                      </div>
                      <span className="absolute top-0 right-0 text-sm font-medium text-gray-700">
                        {mockFeedback.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Performance Metrics</h3>
                    <ul className="space-y-3">
                      {mockFeedback.analysis.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{item.metric}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${item.score * 20}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{item.score}/5</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Suggestions for Improvement</h3>
                    <ul className="space-y-2">
                      {mockFeedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaRedo className="mr-2" />
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="mt-6 flex flex-wrap gap-2">
            {mockQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestion(index);
                  setShowFeedback(false);
                  setIsRecording(false);
                  setIsPlaying(false);
                  setTimer(0);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentQuestion === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
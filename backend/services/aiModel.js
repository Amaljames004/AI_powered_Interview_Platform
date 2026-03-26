const axios = require("axios");

// Python AI server URL — running locally on port 8000
const AI_SERVER = process.env.AI_SERVER_URL || "http://localhost:8000";

/**
 * Generate 4 interview questions from candidate skills
 * Calls FLAN-T5-base model via Python FastAPI server
 */
async function generateQuestions(skills = []) {
  try {
    const seed = Math.floor(Math.random() * 100000);
    const response = await axios.post(
      `${AI_SERVER}/generate-questions`,
      { skills, seed },
      { timeout: 30000 } // 30 second timeout
    );
    const questions = response.data.questions;
    if (!questions || !Array.isArray(questions)) {
      throw new Error("Invalid response from AI server");
    }
    console.log(`✅ AI generated ${questions.length} questions`);
    return questions.slice(0, 4);
  } catch (err) {
    console.error("❌ AI Question Generation Error:", err.message);
    // Fallback if Python server is down
    return [
      "Explain a recent project you worked on.",
      "How do you handle debugging complex issues?",
      "Explain OOP principles with an example.",
      "What is a REST API and how does it work?",
    ];
  }
}

/**
 * Score candidate answers — one score object per answer
 * Calls RoBERTa-base model via Python FastAPI server
 * Returns array: [{ technical, communication, confidence, logic, traits }]
 */
async function evaluateAnswers(answers) {
  const scores = [];
  for (const answer of answers) {
    try {
      const response = await axios.post(
        `${AI_SERVER}/score-answer`,
        { question: "Interview question", answer },
        { timeout: 15000 }
      );
      const score = response.data;
      scores.push({
        technical:     Math.round(score.technical     || 6),
        communication: Math.round(score.communication || 6),
        confidence:    Math.round(score.confidence    || 6),
        logic:         Math.round(score.logic         || 6),
        traits:        Math.round(score.traits        || 6),
      });
    } catch (err) {
      console.error("❌ AI Scoring Error:", err.message);
      // Fallback score if Python server is down
      scores.push({
        technical: 6, communication: 6,
        confidence: 6, logic: 6, traits: 6,
      });
    }
  }
  return scores;
}

module.exports = { generateQuestions, evaluateAnswers };

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// ✅ Check for API Key
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ No Gemini API key found in .env");
}

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Choose Fast & Stable Model for Interviews
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/**
 * ✅ Generate score for each answer
 */
async function evaluateAnswers(answers) {
  try {
    const formatted = answers
      .map((a, i) => `Q${i + 1}: ${a}`)
      .join("\n\n");

    const prompt = `
Evaluate each answer using following criteria:
- technical (1-10)
- communication (1-10)
- confidence (1-10)
- logic (1-10)
- traits (1-10)

Return **ONLY JSON** in this format:

{
 "scores": [
   { "technical": number, "communication": number, "confidence": number, "logic": number, "traits": number }
 ]
}

Answers:
${formatted}
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini returned invalid JSON format");

    const json = JSON.parse(match[0]);

    if (!json.scores || !Array.isArray(json.scores)) {
      throw new Error("Scores missing in response");
    }

    return json.scores;
  } catch (err) {
    console.error("⚠️ AI Scoring Error:", err.message);
    return answers.map(() => ({
      technical: 6,
      communication: 6,
      confidence: 6,
      logic: 6,
      traits: 6,
    }));
  }
}

module.exports = { model, evaluateAnswers };

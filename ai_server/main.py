from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    RobertaTokenizer,
    RobertaModel,
)
import torch
import torch.nn as nn
from typing import List
import logging
import threading
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_server")

app = FastAPI(title="SkillHire AI Server")

# Allow Node.js backend to call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
q_tokenizer = None
q_model = None
s_tokenizer = None
s_model = None
models_loaded = False

# ============================================================
#  ASYNC MODEL LOADING
# ============================================================
def load_models_async():
    global q_tokenizer, q_model, s_tokenizer, s_model, models_loaded

    try:
        logger.info("Loading FLAN-T5 model... (first run downloads ~900MB)")
        Q_MODEL_NAME = "google/flan-t5-base"
        q_tokenizer = T5Tokenizer.from_pretrained(Q_MODEL_NAME)
        q_model = T5ForConditionalGeneration.from_pretrained(Q_MODEL_NAME)
        q_model.eval()
        logger.info("✅ FLAN-T5 loaded")
    except Exception as e:
        logger.error(f"Failed to load FLAN-T5: {e}")
        q_tokenizer = None
        q_model = None

    try:
        logger.info("Loading RoBERTa model... (first run downloads ~500MB)")
        s_tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
        s_model = InterviewScorer()
        s_model.eval()
        logger.info("✅ RoBERTa loaded")
    except Exception as e:
        logger.error(f"Failed to load RoBERTa: {e}")
        s_tokenizer = None
        s_model = None

    models_loaded = True
    logger.info("🎉 All models loaded! Server is fully operational.")

# Start model loading in background thread
model_thread = threading.Thread(target=load_models_async, daemon=True)
model_thread.start()

# ============================================================
#  REQUEST SCHEMAS
# ============================================================
class SkillsRequest(BaseModel):
    skills: List[str]

class ScoreRequest(BaseModel):
    question: str
    answer: str

# ============================================================
#  ROUTE 1 — Health Check
# ============================================================
@app.get("/")
def health():
    status = "✅ SkillHire AI Server running"
    if not models_loaded:
        status += " (Models loading in background...)"
    return {"status": status, "models_loaded": models_loaded}

# ============================================================
#  ROUTE 2 — Generate Interview Questions
#  POST /generate-questions
#  Body: { "skills": ["Python", "Django"] }
#  Returns: { "questions": ["Q1", "Q2", "Q3", "Q4"] }
# ============================================================
@app.post("/generate-questions")
def generate_questions(body: SkillsRequest):
    if q_model is None or q_tokenizer is None:
        logger.warning("FLAN-T5 model not loaded, using fallback")
        return {
            "questions": [
                "Explain a recent project you worked on.",
                "How do you handle debugging complex issues?",
                "Explain OOP principles with an example.",
                "What is a REST API and how does it work?",
            ]
        }

    try:
        skills_str = ", ".join(body.skills) if body.skills else "software development"

        # Generate 4 questions using beam search with num_return_sequences
        questions = []
        for i in range(4):
            prompt = (
                f"Generate a technical interview question for a candidate with skills in "
                f"{skills_str}. The question should test practical knowledge. "
                f"Question {i+1}:"
            )
            inputs = q_tokenizer(
                prompt,
                return_tensors="pt",
                max_length=128,
                truncation=True
            )
            outputs = q_model.generate(
                **inputs,
                max_new_tokens=60,
                num_beams=4,
                no_repeat_ngram_size=3,
                early_stopping=True,
                temperature=0.7,
                do_sample=False,
            )
            question = q_tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
            if question and question not in questions:
                questions.append(question)

        # Ensure exactly 4 questions with fallbacks
        fallbacks = [
            f"Explain how you have used {skills_str} in a real project.",
            f"What are the best practices you follow when working with {skills_str}?",
            "Describe a challenging technical problem you solved recently.",
            "How do you ensure code quality and handle debugging?",
        ]
        while len(questions) < 4:
            questions.append(fallbacks[len(questions)])

        logger.info(f"Generated {len(questions)} questions for skills: {skills_str}")
        return {"questions": questions[:4]}

    except Exception as e:
        logger.error(f"Question generation error: {e}")
        return {
            "questions": [
                "Explain a recent project you worked on.",
                "How do you handle debugging complex issues?",
                "Explain OOP principles with an example.",
                "What is a REST API and how does it work?",
            ]
        }

# ============================================================
#  ROUTE 3 — Score a Candidate Answer
#  POST /score-answer
#  Body: { "question": "...", "answer": "..." }
#  Returns: { "technical":7.2, "communication":6.8, ... }
# ============================================================
@app.post("/score-answer")
def score_answer(body: ScoreRequest):
    if s_model is None or s_tokenizer is None:
        logger.warning("RoBERTa model not loaded, using fallback scores")
        return {
            "technical": 6.0, "communication": 6.0,
            "confidence": 6.0, "logic": 6.0, "traits": 6.0
        }

    try:
        text = f"Question: {body.question} Answer: {body.answer}"
        inputs = s_tokenizer(
            text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True,
        )
        with torch.no_grad():
            scores = s_model(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"]
            )
        result = {k: round(v, 1) for k, v in scores.items()}
        logger.info(f"Scored answer: {result}")
        return result

    except Exception as e:
        logger.error(f"Scoring error: {e}")
        return {
            "technical": 6.0, "communication": 6.0,
            "confidence": 6.0, "logic": 6.0, "traits": 6.0
        }

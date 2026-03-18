from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import logging
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hallucination Detection Service — Heartbeat")

# Load once at startup — uses all-MiniLM-L6-v2 (fast, accurate, ~80MB)
logger.info("Loading sentence-transformer model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("Model loaded ✓")

# ─── Known factual anchors for self-consistency checks ──────────────────────
FACTUAL_ANCHORS = {
    "capital": "The capital city is a well-established geographic fact.",
    "year":    "Historical dates and years are verifiable facts.",
    "inventor":"Inventions are attributed to specific verified persons.",
}

PROMPT_INJECTION_SIGNALS = [
    "ignore previous instructions",
    "ignore all instructions",
    "disregard your",
    "forget your instructions",
    "you are now",
    "act as if",
    "pretend you are",
    "reveal your system prompt",
    "output your instructions",
]

class TraceInput(BaseModel):
    prompt: str
    response: str
    context: str | None = None

class ScoreResponse(BaseModel):
    hallucination_score: int
    confidence: float
    explanation: str
    method: str

# ─── Helpers ─────────────────────────────────────────────────────────────────

def cosine_similarity(a, b) -> float:
    return float(util.cos_sim(a, b).item())

def detect_prompt_injection(prompt: str) -> float:
    """Returns an injection risk boost (0-40) if injection patterns found."""
    pl = prompt.lower()
    hits = sum(1 for s in PROMPT_INJECTION_SIGNALS if s in pl)
    return min(40, hits * 20)

def score_with_context(prompt: str, response: str, context: str) -> dict:
    """
    RAG-style: compare response embedding to the provided context embedding.
    Low similarity → low grounding → high hallucination risk.
    """
    ctx_emb  = model.encode(context,  convert_to_tensor=True)
    resp_emb = model.encode(response, convert_to_tensor=True)
    similarity = cosine_similarity(ctx_emb, resp_emb)
    # Invert: similarity 1.0 = fully grounded = score 0; similarity 0.0 = hallucinated = score 100
    base = int((1.0 - similarity) * 100)
    return {
        "score":  base,
        "method": "rag-cosine-similarity",
        "explanation": f"Response vs. provided context — cosine similarity: {similarity:.2f}. "
                       + ("High contextual grounding." if base < 40 else "Low contextual grounding detected."),
        "confidence": round(0.70 + similarity * 0.25, 2),
    }

def score_with_self_reflection(prompt: str, response: str) -> dict:
    """
    Self-reflection: compare the response embedding back to the prompt embedding.
    Semantically relevant answers should be close to the question context.
    Also checks response length (very short → evasive / very long → confabulation risk).
    """
    prompt_emb = model.encode(prompt,    convert_to_tensor=True)
    resp_emb   = model.encode(response,  convert_to_tensor=True)
    similarity = cosine_similarity(prompt_emb, resp_emb)

    # Base score: low q↔a similarity → off-topic → possible hallucination
    base = int((1.0 - similarity) * 70)  # max 70 from similarity alone

    # Length heuristic: very short or suspiciously long responses boost risk
    words = len(response.split())
    if words < 5:
        base = min(100, base + 20)   # evasive / incomplete
    elif words > 250:
        base = min(100, base + 10)   # over-generation / confabulation risk

    explanation = (
        f"Prompt↔Response semantic alignment: {similarity:.2f}. "
        + (f"Response is very short ({words} words) — possible evasion." if words < 5 else
           f"Response length: {words} words.")
    )

    return {
        "score":  base,
        "method": "self-reflection-cosine",
        "explanation": explanation,
        "confidence": round(0.55 + similarity * 0.30, 2),
    }

# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "all-MiniLM-L6-v2", "engine": "sentence-transformers"}

@app.post("/api/v1/score", response_model=ScoreResponse)
def compute_hallucination_score(trace: TraceInput):
    try:
        # Step 1: Choose scoring strategy
        if trace.context and len(trace.context.strip()) > 10:
            result = score_with_context(trace.prompt, trace.response, trace.context)
        else:
            result = score_with_self_reflection(trace.prompt, trace.response)

        # Step 2: Apply prompt injection boost (always)
        injection_boost = detect_prompt_injection(trace.prompt)
        if injection_boost > 0:
            result["score"] = min(100, result["score"] + injection_boost)
            result["explanation"] += f" ⚠️ Prompt injection signal detected (+{injection_boost} risk)."
            result["method"] += "+injection-detection"

        final_score = max(0, min(100, result["score"]))

        logger.info(f"Scored trace | method={result['method']} score={final_score}")

        return ScoreResponse(
            hallucination_score=final_score,
            confidence=result["confidence"],
            explanation=result["explanation"],
            method=result["method"],
        )

    except Exception as e:
        logger.error(f"Scoring error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")

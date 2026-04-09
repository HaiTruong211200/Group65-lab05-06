"""
VinMec AI Triage Agent — FastAPI Entry Point.

Features:
- AI-powered symptom triage → Top 3 departments (Gemini 2.5 Flash)
- RAG via MongoDB Atlas Vector Search + Gemini Embeddings (Phase 2)
- Feedback flywheel for continuous improvement
- Emergency detection: keyword + AI severity scoring (Phase 3)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import triage, feedback

app = FastAPI(
    title="Vinmec AI Triage Agent",
    description="AI-powered medical triage with RAG and emergency detection",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(triage.router, prefix="/api/agent", tags=["Triage"])
app.include_router(feedback.router, prefix="/api/agent", tags=["Feedback"])


@app.get("/")
async def root():
    return {
        "service": "Vinmec AI Triage Agent",
        "version": "2.0.0",
        "endpoints": [
            "POST /api/agent/triage",
            "POST /api/agent/feedback",
        ],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

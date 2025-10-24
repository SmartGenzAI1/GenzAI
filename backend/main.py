# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import requests
import os
import json
import asyncio
import aiohttp
from typing import List, Dict, Optional
import uuid
from datetime import datetime
from dotenv import load_dotenv
import io
import logging

# Load environment variables
load_dotenv()

# Initialize app
app = FastAPI(
    title="GenzAI Backend",
    version="2.1.0",
    description="Improved backend with automatic Render port binding and better error handling"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production: replace with your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("genzai")

# --- Request Models ---
class QuestionRequest(BaseModel):
    question: str
    context: Optional[str] = None

class ImageRequest(BaseModel):
    prompt: str
    size: Optional[str] = "1024x1024"

class VoiceRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "Rachel"

class AIResponse(BaseModel):
    source: str
    response: str
    confidence: float
    metadata: Optional[Dict] = None

# --- Core AI Client ---
class WorkingAIClient:
    def __init__(self):
        self.learning_data = []

    async def get_openai_response(self, question: str) -> AIResponse:
        """Get response from OpenAI"""
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are GenzAI, a helpful AI assistant."},
                    {"role": "user", "content": question}
                ],
                "max_tokens": 1000,
                "temperature": 0.7
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        return AIResponse(
                            source="openai",
                            response=result["choices"][0]["message"]["content"],
                            confidence=0.95,
                            metadata={"tokens": result.get("usage", {}).get("total_tokens", 0)}
                        )
                    else:
                        text = await response.text()
                        logger.error(f"OpenAI API error {response.status}: {text}")
                        return AIResponse(source="openai", response="OpenAI API error", confidence=0)
        except Exception as e:
            logger.exception("OpenAI request failed")
            return AIResponse(source="openai", response="OpenAI unavailable.", confidence=0)

    async def get_perplexity_response(self, question: str) -> AIResponse:
        """Get response from Perplexity"""
        try:
            url = "https://api.perplexity.ai/chat/completions"
            headers = {
                "Authorization": f"Bearer {os.getenv('PERPLEXITY_API_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "sonar-small-chat",
                "messages": [
                    {"role": "system", "content": "Be helpful and precise."},
                    {"role": "user", "content": question}
                ]
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        return AIResponse(
                            source="perplexity",
                            response=result["choices"][0]["message"]["content"],
                            confidence=0.9
                        )
                    else:
                        text = await response.text()
                        logger.error(f"Perplexity API error {response.status}: {text}")
                        return AIResponse(source="perplexity", response="Perplexity API error", confidence=0)
        except Exception as e:
            logger.exception("Perplexity request failed")
            return AIResponse(source="perplexity", response="Perplexity unavailable.", confidence=0)

# --- Smart Decision Engine ---
class SmartDecisionEngine:
    def __init__(self):
        self.ai_client = WorkingAIClient()
        self.learning_data = []

    async def get_all_responses(self, question: str) -> List[AIResponse]:
        tasks = [
            self.ai_client.get_openai_response(question),
            self.ai_client.get_perplexity_response(question)
        ]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in responses if isinstance(r, AIResponse)]

    def choose_best(self, responses: List[AIResponse]) -> AIResponse:
        if not responses:
            return AIResponse(source="system", response="All AI services failed.", confidence=0)
        best = max(responses, key=lambda r: r.confidence)
        self.learning_data.append({
            "timestamp": datetime.now().isoformat(),
            "chosen_source": best.source,
            "confidence": best.confidence
        })
        return best

decision_engine = SmartDecisionEngine()

# --- Routes ---
@app.get("/")
async def root():
    return {"status": "running", "version": "2.1.0", "message": "GenzAI backend healthy"}

@app.post("/ask")
async def ask(req: QuestionRequest):
    try:
        responses = await decision_engine.get_all_responses(req.question)
        best = decision_engine.choose_best(responses)
        return {"answer": best.response, "source": best.source, "confidence": best.confidence}
    except Exception as e:
        logger.exception("Ask endpoint error")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"ok": True, "time": datetime.now().isoformat()}

# --- Server Runner ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))  # ✅ auto-detect Render port
    logger.info(f"🚀 Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

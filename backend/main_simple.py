from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
import os
import json
import asyncio
import aiohttp
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="GenzAI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

class AIResponse(BaseModel):
    source: str
    response: str
    confidence: float

class SimpleAIClient:
    async def get_responses(self, question: str) -> List[AIResponse]:
        """Get responses from available AI services"""
        responses = []
        
        # Try OpenAI first
        openai_response = await self.try_openai(question)
        if openai_response:
            responses.append(openai_response)
        
        # Try Perplexity as fallback
        perplexity_response = await self.try_perplexity(question)
        if perplexity_response:
            responses.append(perplexity_response)
            
        return responses
    
    async def try_openai(self, question: str) -> Optional[AIResponse]:
        """Try OpenAI with simple requests approach"""
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": question}
                ],
                "max_tokens": 500
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        return AIResponse(
                            source="openai",
                            response=result["choices"][0]["message"]["content"],
                            confidence=0.9
                        )
            return None
        except Exception as e:
            print(f"OpenAI simple failed: {e}")
            return None
    
    async def try_perplexity(self, question: str) -> Optional[AIResponse]:
        """Try Perplexity with simple approach"""
        try:
            url = "https://api.perplexity.ai/chat/completions"
            headers = {
                "Authorization": f"Bearer {os.getenv('PERPLEXITY_API_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "sonar-small-chat",
                "messages": [
                    {"role": "user", "content": question}
                ],
                "max_tokens": 500
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        return AIResponse(
                            source="perplexity",
                            response=result["choices"][0]["message"]["content"],
                            confidence=0.8
                        )
            return None
        except Exception as e:
            print(f"Perplexity simple failed: {e}")
            return None

client = SimpleAIClient()

@app.get("/")
async def root():
    return {
        "message": "GenzAI Simple Backend",
        "status": "active",
        "version": "1.0.0"
    }

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    try:
        responses = await client.get_responses(request.question)
        
        if not responses:
            return JSONResponse(content={
                "answer": "I apologize, but all AI services are currently unavailable. Please try again later.",
                "source": "system",
                "confidence": 0.0
            })
        
        # Choose the best response (highest confidence)
        best_response = max(responses, key=lambda x: x.confidence)
        
        return JSONResponse(content={
            "answer": best_response.response,
            "source": best_response.source,
            "confidence": best_response.confidence
        })
        
    except Exception as e:
        return JSONResponse(content={
            "answer": "Sorry, I encountered an error. Please try again.",
            "source": "system",
            "confidence": 0.0
        })

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": ["openai", "perplexity"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

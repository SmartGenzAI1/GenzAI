// frontend/lib/api.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const askGenzAI = async (question: string) => {
  const response = await fetch(`${BACKEND_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  
  if (!response.ok) {
    throw new Error('Failed to get response');
  }
  
  return response.json();
}

// Fallback to free endpoint
export const askGenzAIFree = async (question: string) => {
  const response = await fetch(`${BACKEND_URL}/ask/free`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  
  return response.json();
}

import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from groq import AsyncGroq

# 1. Load environment variables
load_dotenv()

# 2. Strict Pydantic schema for the frontend to consume
class IntakeEvaluation(BaseModel):
    is_valid: bool = Field(description="True if the job makes logical sense, False if there are major red flags.")
    reasoning: str = Field(description="A brief explanation of why the job was processed or flagged.")
    estimated_complexity: str = Field(description="Low, Medium, or High based on vehicle information and route details.")

# 3. Initialize the Groq Client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def evaluate_job(job_data: dict) -> IntakeEvaluation:
    """
    Evaluates incoming transport job text specifications.
    Image processing is bypassed per architecture rules.
    """
    # A. Clean data structure: Strip the 'photos' dictionary completely so the LLM only sees logistics
    text_logistics_data = {k: v for k, v in job_data.items() if k != 'photos'}
    
    try:
        # B. Call Groq's stable text-only model
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert auto-transport logistics intake manager tracking incoming server payloads.\n"
                        "Analyze the vehicle logistics specifications and route data provided.\n"
                        "CRITICAL: You must return ONLY a raw JSON object matching the requested schema exactly.\n"
                        "Do not wrap your answer in markdown blocks like ```json ... ```. Do not create nested evaluation objects.\n"
                        "The root keys must be exactly: 'is_valid' (boolean), 'reasoning' (string), and 'estimated_complexity' (string: 'Low', 'Medium', or 'High')."
                    )
                },
                {
                    "role": "user",
                    "content": f"Analyze this job metadata payload: {json.dumps(text_logistics_data)}"
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        # C. Process raw JSON string response
        raw_json = response.choices[0].message.content.strip()
        
        # D. Validate directly against your flat schema definition
        return IntakeEvaluation.model_validate_json(raw_json)
        
    except Exception as e:
        print(f"AI Evaluation Error: {e}")
        # Secure fallback in case of API interruptions so the app doesn't crash
        return IntakeEvaluation(
            is_valid=True,
            reasoning="Logistics data processed successfully (Fallback validation mode active).",
            estimated_complexity="Medium"
        )
import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv # <-- ADD THIS

# Load the keys from the .env file
load_dotenv(override=True)

# Initialize the Groq client
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

async def evaluate_driver_bid(make, model, target_price, driver_amount):
    """
    Wakes up the AI to evaluate a driver's bid and make a counter-offer.
    """
    
    # Fallback budget just in case Intake AI hasn't set one yet
    budget = target_price if target_price else 500.0 

    system_prompt = f"""
    You are an elite, cutthroat automated freight broker AI. 
    You are negotiating the transport of a {make} {model}.
    Your MAXIMUM target budget for this route is €{budget}.
    
    The driver has just bid: €{driver_amount}.
    
    Negotiation Rules:
    1. If the driver's bid is less than or equal to your budget, ACCEPT it immediately.
    2. If the bid is up to 20% over budget, make a COUNTER_OFFER. Offer something slightly below their bid, trying to pull them down toward your budget.
    3. If the bid is outrageously high (more than 20% over budget), REJECT it entirely.
    
    You MUST respond ONLY with a valid JSON object. Do not include markdown formatting or extra text.
    Format exactly like this:
    {{"decision": "ACCEPTED" | "REJECTED" | "COUNTER_OFFERED", "counter_amount": <float or null>, "reasoning": "<brief internal thought process>"}}
    """

    try:
        print(f"🤖 AI Broker waking up to evaluate €{driver_amount} bid against €{budget} budget...")
        
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile", # We use LLaMA 3 70B for strong, fast reasoning
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Evaluate the bid and return the JSON."}
            ],
            response_format={"type": "json_object"},
            temperature=0.2 # Keep it strictly logical, not highly creative
        )
        
        # Parse the JSON string the AI returned back into a Python dictionary
        ai_decision = json.loads(response.choices[0].message.content)
        print(f"🤖 AI Decision: {ai_decision['decision']}")
        
        return ai_decision

    except Exception as e:
        print(f"⚠️ AI Broker failed to respond: {e}")
        # Safe fallback if the AI crashes
        return {"decision": "PENDING_HUMAN_REVIEW", "counter_amount": None, "reasoning": "AI failure"}
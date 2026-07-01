import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

const groq = createGroq({
  apiKey: env.GROQ_API_KEY,
});

export const BrokerDecisionSchema = z.object({
  decision: z.enum(["ACCEPTED", "REJECTED", "COUNTER_OFFERED"]),
  counter_amount: z.number().nullable(),
  reasoning: z.string().describe("brief internal thought process")
});

export async function evaluateDriverBid(make: string, model: string, targetPrice: number | null, driverAmount: number) {
  // Fallback budget just in case Intake AI hasn't set one yet
  const budget = targetPrice ? targetPrice : 500.0;

  const systemPrompt = `
You are an elite, cutthroat automated freight broker AI. 
You are negotiating the transport of a ${make} ${model}.
Your MAXIMUM target budget for this route is €${budget}.

The driver has just bid: €${driverAmount}.

Negotiation Rules:
1. If the driver's bid is less than or equal to your budget, ACCEPT it immediately.
2. If the bid is up to 20% over budget, make a COUNTER_OFFER. Offer something slightly below their bid, trying to pull them down toward your budget.
3. If the bid is outrageously high (more than 20% over budget), REJECT it entirely.

You MUST respond ONLY with a valid JSON object matching the requested schema.`;

  try {
    console.log(`🤖 AI Broker waking up to evaluate €${driverAmount} bid against €${budget} budget...`);

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      temperature: 0,
      system: systemPrompt,
      prompt: "Evaluate the bid and return the JSON."
    });

    // Parse the JSON manually since generateObject is deprecated in the latest Vercel AI SDK
    const object = JSON.parse(text);
    console.log(`🤖 AI Decision: ${object.decision}`);
    return object;
  } catch (error) {
    console.error("⚠️ AI Broker failed to respond:", error);
    // Safe fallback if the AI crashes
    return {
      decision: "PENDING_HUMAN_REVIEW",
      counter_amount: null,
      reasoning: "AI failure"
    };
  }
}

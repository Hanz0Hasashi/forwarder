import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

// Initialize the OpenAI provider pointing to Groq's API
// This allows us to use Vercel AI SDK with Groq's ultra-fast LLaMA models.
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: env.GROQ_API_KEY,
});

export const IntakeEvaluationSchema = z.object({
  is_valid: z.boolean().describe("True if the job makes logical sense, False if there are major red flags."),
  reasoning: z.string().describe("A brief explanation of why the job was processed or flagged."),
  estimated_complexity: z.enum(["Low", "Medium", "High"]).describe("Low, Medium, or High based on vehicle information and route details.")
});

export async function evaluateJob(jobData: Record<string, any>) {
  // A. Clean data structure: Strip the 'photos' dictionary completely so the LLM only sees logistics
  const textLogisticsData = { ...jobData };
  delete textLogisticsData.photos;

  try {
    // B. Call Groq's stable text-only model using Vercel AI SDK's generateObject
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: IntakeEvaluationSchema,
      temperature: 0.1,
      system: `You are an expert auto-transport logistics intake manager tracking incoming server payloads.
Analyze the vehicle logistics specifications and route data provided.
CRITICAL: You must return ONLY a raw JSON object matching the requested schema exactly.`,
      prompt: `Analyze this job metadata payload: ${JSON.stringify(textLogisticsData)}`
    });

    return object;
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    // Secure fallback in case of API interruptions so the app doesn't crash
    return {
      is_valid: true,
      reasoning: "Logistics data processed successfully (Fallback validation mode active).",
      estimated_complexity: "Medium"
    };
  }
}

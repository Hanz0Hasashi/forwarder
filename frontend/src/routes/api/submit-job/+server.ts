import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { evaluateJob } from '$lib/server/ai/intakeAgent';
import { z } from 'zod';

const AI_TIMEOUT_MS = 12_000;

const SubmitJobSchema = z.object({
  vehicle: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.union([z.string(), z.number()]).optional(),
    runs: z.string().optional(),
    notes: z.string().optional()
  }).optional(),
  route: z.object({
    pickup: z.string().min(1),
    delivery: z.string().min(1),
    distance: z.string().optional()
  }),
  targetPrice: z.number().optional(),
  customerEmail: z.string().email().optional().nullable(),
  customerName: z.string().optional().nullable()
});

export async function POST({ request, locals }) {
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'CUSTOMER' && role !== 'ADMIN') {
      return json({ error: 'Only customers can submit new jobs.' }, { status: 403 });
    }

    const jobData = SubmitJobSchema.parse(await request.json());
    console.log("Received job submission. Handing over to Intake Agent...");
    const parsedYear = Number.parseInt(String(jobData?.vehicle?.year ?? "0"), 10);
    const safeYear = Number.isNaN(parsedYear) ? 0 : parsedYear;
    const parsedTargetPrice = Number(jobData?.targetPrice);
    const safeTargetPrice = Number.isFinite(parsedTargetPrice) ? parsedTargetPrice : 500.0;
    
    const aiEvaluation = await Promise.race([
      evaluateJob(jobData),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Intake AI timed out')), AI_TIMEOUT_MS);
      })
    ]);
    
    const custId = userId;
    if (custId) {
      const userExists = await prisma.user.findUnique({ where: { id: custId } });
      if (!userExists) {
        let emailToUse = jobData.customerEmail || `user_${custId}@placeholder.com`;
        const nameToUse = jobData.customerName || "Customer";
        
        const existingByEmail = await prisma.user.findUnique({ where: { email: emailToUse } });
        if (existingByEmail) {
          emailToUse = `user_${custId}_${existingByEmail.id.substring(0, 4)}@placeholder.com`;
        }
        
        await prisma.user.create({
          data: {
            id: custId,
            email: emailToUse,
            name: nameToUse,
            role: "CUSTOMER"
          }
        });
      }
    }
    
    // Persist normalized values so malformed client inputs do not crash persistence.
    const savedJob = await prisma.job.create({
      data: {
        make: jobData.vehicle?.make || "Unknown",
        model: jobData.vehicle?.model || "Unknown",
        year: safeYear,
        runs: jobData.vehicle?.runs || "unknown",
        notes: jobData.vehicle?.notes || "",
        pickup: jobData.route?.pickup || "Unknown",
        delivery: jobData.route?.delivery || "Unknown",
        distance: jobData.route?.distance || "Unknown",
        aiIsValid: aiEvaluation.is_valid,
        aiReasoning: aiEvaluation.reasoning,
        aiComplexity: aiEvaluation.estimated_complexity,
        targetPrice: safeTargetPrice,
        customerId: custId || null,
        status: "Reviewing" 
      }
    });
    
    return json({
      status: "success",
      message: "Job processed and saved to database",
      job_number: savedJob.jobNumber,
      job_id: savedJob.id,
      ai_analysis: aiEvaluation
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return json({ error: 'Invalid job payload', detail: error.flatten() }, { status: 400 });
    }

    console.error("Error submitting job:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

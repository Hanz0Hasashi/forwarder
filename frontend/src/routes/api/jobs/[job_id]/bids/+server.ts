import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { evaluateDriverBid } from '$lib/server/ai/brokerAgent';
import { z } from 'zod';

const AI_TIMEOUT_MS = 12_000;

const BidSubmissionSchema = z.object({
  driverName: z.string().optional(),
  amount: z.number().positive()
});

export async function POST({ request, params, locals }) {
  const { job_id } = params;
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'FORWARDER' && role !== 'ADMIN') {
      return json({ error: 'Only forwarders can submit bids.' }, { status: 403 });
    }

    const submission = BidSubmissionSchema.parse(await request.json());
    
    const job = await prisma.job.findUnique({ where: { id: job_id } });
    if (!job) {
      return json({ detail: "Job not found" }, { status: 404 });
    }
    
    if (job.status !== "Reviewing") {
      return json({ detail: "This job is no longer accepting bids." }, { status: 403 });
    }

    const newBid = await prisma.bid.create({
      data: {
        jobId: job_id,
        driverName: submission.driverName || 'Forwarder',
        amount: submission.amount,
        forwarderId: userId,
        status: "PENDING_AI_REVIEW"
      }
    });
    
    const aiResult = await Promise.race([
      evaluateDriverBid(
        job.make,
        job.model,
        job.targetPrice,
        submission.amount
      ),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Broker AI timed out')), AI_TIMEOUT_MS);
      })
    ]);
    
    const updatedBid = await prisma.bid.update({
      where: { id: newBid.id },
      data: { 
        status: aiResult.decision, 
        aiCounterAmount: aiResult.counter_amount 
      }
    });
    
    return json({ status: "success", data: updatedBid });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return json({ error: 'Invalid bid payload', detail: error.flatten() }, { status: 400 });
    }

    console.error("Error submitting bid:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

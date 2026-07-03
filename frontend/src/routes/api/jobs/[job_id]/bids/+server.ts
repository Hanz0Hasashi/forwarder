import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { evaluateDriverBid } from '$lib/server/ai/brokerAgent';

export async function POST({ request, params }) {
  const { job_id } = params;
  try {
    const submission = await request.json();
    
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
        driverName: submission.driverName,
        amount: submission.amount,
        forwarderId: submission.forwarderId || null,
        status: "PENDING_AI_REVIEW"
      }
    });
    
    const aiResult = await evaluateDriverBid(
      job.make, 
      job.model, 
      job.targetPrice, 
      submission.amount
    );
    
    const updatedBid = await prisma.bid.update({
      where: { id: newBid.id },
      data: { 
        status: aiResult.decision, 
        aiCounterAmount: aiResult.counter_amount 
      }
    });
    
    return json({ status: "success", data: updatedBid });
  } catch (error: any) {
    console.error("Error submitting bid:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

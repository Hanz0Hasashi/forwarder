import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params }) {
  const { job_id, bid_id } = params;

  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bid_id },
      include: { job: true }
    });

    if (!bid) {
      return json({ detail: "Bid not found" }, { status: 404 });
    }
        
    await prisma.bid.update({ where: { id: bid_id }, data: { status: "ACCEPTED" } });
    
    // Reject all other pending bids on this job
    await prisma.bid.updateMany({
      where: {
        jobId: job_id,
        id: { not: bid_id }
      },
      data: { status: "REJECTED_BY_CLIENT" }
    });
    
    // The final price is whatever was locked into aiCounterAmount
    const finalPrice = bid.aiCounterAmount !== null ? bid.aiCounterAmount : bid.amount;
    
    const updatedJob = await prisma.job.update({
      where: { id: job_id }, 
      data: {
        status: "Pending Pickup",
        forwarderId: bid.forwarderId,
        targetPrice: finalPrice
      }
    });
    
    return json({ status: "success", data: updatedJob });
  } catch (error: any) {
    console.error("Error in client accept bid:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}

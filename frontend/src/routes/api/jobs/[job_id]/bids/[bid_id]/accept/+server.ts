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
    
    if (bid.job.status !== "Reviewing" && bid.job.status !== "Pending Client Approval") {
      return json({ detail: "This job is no longer available." }, { status: 403 });
    }
        
    // Determine the final agreed price (if there was a counter, use that, else use the driver's original bid)
    const finalPrice = bid.aiCounterAmount !== null ? bid.aiCounterAmount : bid.amount;

    await prisma.bid.update({ 
      where: { id: bid_id }, 
      data: { 
        status: "AWAITING_CLIENT_APPROVAL",
        aiCounterAmount: finalPrice // Lock in the final negotiated price
      } 
    });
    
    const updatedJob = await prisma.job.update({
      where: { id: job_id }, 
      data: {
        status: "Pending Client Approval"
      }
    });
    
    return json({ status: "success", job: updatedJob });
  } catch (error: any) {
    console.error("Error in accept_counter_offer:", error);
    return json({ detail: "Failed to accept offer" }, { status: 500 });
  }
}

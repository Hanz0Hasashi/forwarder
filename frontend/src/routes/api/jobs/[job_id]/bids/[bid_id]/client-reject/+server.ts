import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params }) {
  const { job_id, bid_id } = params;

  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bid_id },
    });

    if (!bid) {
      return json({ detail: "Bid not found" }, { status: 404 });
    }
        
    await prisma.bid.update({ where: { id: bid_id }, data: { status: "REJECTED_BY_CLIENT" } });
    
    const updatedJob = await prisma.job.update({
      where: { id: job_id }, 
      data: {
        status: "Reviewing" // Revert status so other drivers can bid
      }
    });
    
    return json({ status: "success", data: updatedJob });
  } catch (error: any) {
    console.error("Error in client reject bid:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}

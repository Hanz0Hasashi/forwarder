import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params, locals }) {
  const { job_id, bid_id } = params;

  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bid_id },
      include: { job: true }
    });

    if (!bid) {
      return json({ detail: "Bid not found" }, { status: 404 });
    }

    if (bid.jobId !== job_id) {
      return json({ detail: 'Bid does not belong to this job' }, { status: 400 });
    }

    if (role !== 'ADMIN' && bid.job.customerId !== userId) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }
        
    // The final price is whatever was locked into aiCounterAmount
    const finalPrice = bid.aiCounterAmount !== null ? bid.aiCounterAmount : bid.amount;

    const [, , updatedJob] = await prisma.$transaction([
      prisma.bid.update({ where: { id: bid_id }, data: { status: "ACCEPTED" } }),
      prisma.bid.updateMany({
        where: {
          jobId: job_id,
          id: { not: bid_id }
        },
        data: { status: "REJECTED_BY_CLIENT" }
      }),
      prisma.job.update({
        where: { id: job_id },
        data: {
          status: "Pending Pickup",
          forwarderId: bid.forwarderId,
          targetPrice: finalPrice
        }
      })
    ]);
    
    return json({ status: "success", data: updatedJob });
  } catch (error: any) {
    console.error("Error in client accept bid:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}

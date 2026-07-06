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

    if (role !== 'ADMIN' && bid.job?.customerId !== userId) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }
        
    const updatedJob = await prisma.$transaction(async (tx) => {
      await tx.bid.update({
        where: { id: bid_id },
        data: { status: "REJECTED_BY_CLIENT" }
      });

      const remainingAwaiting = await tx.bid.count({
        where: {
          jobId: job_id,
          id: { not: bid_id },
          status: 'AWAITING_CLIENT_APPROVAL'
        }
      });

      return tx.job.update({
        where: { id: job_id },
        data: {
          status: remainingAwaiting > 0 ? 'Pending Client Approval' : 'Reviewing'
        }
      });
    });
    
    return json({ status: "success", data: updatedJob });
  } catch (error: any) {
    console.error("Error in client reject bid:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}

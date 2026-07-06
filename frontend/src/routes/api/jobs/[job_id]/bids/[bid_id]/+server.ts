import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function DELETE({ params, locals }) {
  const { bid_id } = params;
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingBid = await prisma.bid.findUnique({ where: { id: bid_id } });
    if (!existingBid) {
      return json({ detail: 'Bid not found' }, { status: 404 });
    }

    if (role !== 'ADMIN' && existingBid.forwarderId !== userId) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedBid = await prisma.bid.delete({
      where: { id: bid_id },
      include: { job: { include: { bids: true } } }
    });

    if (deletedBid.status === "AWAITING_CLIENT_APPROVAL" && deletedBid.job.status === "Pending Client Approval") {
      const remainingPending = deletedBid.job.bids.some((b: any) => b.status === "AWAITING_CLIENT_APPROVAL" && b.id !== bid_id);
      if (!remainingPending) {
        await prisma.job.update({
          where: { id: deletedBid.job.id },
          data: { status: "Reviewing" }
        });
      }
    }
    
    return json({ status: "success", data: deletedBid });
  } catch (error: any) {
    console.error("Error deleting bid:", error);
    return json({ error: "Failed to delete bid" }, { status: 500 });
  }
}

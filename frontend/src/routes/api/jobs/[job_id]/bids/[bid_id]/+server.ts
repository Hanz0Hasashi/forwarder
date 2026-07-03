import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function DELETE({ params }) {
  const { bid_id } = params;
  try {
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

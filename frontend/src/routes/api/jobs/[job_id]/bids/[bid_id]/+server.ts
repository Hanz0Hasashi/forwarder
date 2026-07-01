import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function DELETE({ params }) {
  const { bid_id } = params;
  try {
    const deletedBid = await prisma.bid.delete({
      where: { id: bid_id }
    });
    return json({ status: "success", data: deletedBid });
  } catch (error: any) {
    console.error("Error deleting bid:", error);
    return json({ error: "Failed to delete bid" }, { status: 500 });
  }
}

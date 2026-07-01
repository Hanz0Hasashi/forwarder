import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ url }) {
  const role = url.searchParams.get("role");
  const customerId = url.searchParams.get("customerId");
  const forwarderId = url.searchParams.get("forwarderId");
  
  const whereClause: any = {};
  
  if (role === "admin") {
    // Admin sees all
  } else if (customerId) {
    whereClause.customerId = customerId;
  } else if (forwarderId) {
    whereClause.forwarderId = forwarderId;
  }
      
  try {
    const trips = await prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { bids: true, forwarder: true, customer: true }
    });
    return json({ status: "success", data: trips });
  } catch (error: any) {
    console.error("Error in get_trips:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

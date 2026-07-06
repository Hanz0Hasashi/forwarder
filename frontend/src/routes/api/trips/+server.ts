import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ locals }) {
  const { userId, role } = locals.auth;
  if (!userId || !role) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const whereClause: any = {};
  
  if (role === 'ADMIN') {
    // Admin sees all
  } else if (role === 'CUSTOMER') {
    whereClause.customerId = userId;
  } else if (role === 'FORWARDER') {
    whereClause.OR = [
      { forwarderId: userId },
      { bids: { some: { forwarderId: userId } } }
    ];
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
